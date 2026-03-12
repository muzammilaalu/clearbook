import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

const COUNTRY_MAP = {
  'india': 'IN', 'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB',
  'united states': 'US', 'usa': 'US', 'us': 'US', 'canada': 'CA',
  'australia': 'AU', 'germany': 'DE', 'france': 'FR', 'spain': 'ES',
  'italy': 'IT', 'netherlands': 'NL', 'singapore': 'SG', 'uae': 'AE',
};

// All valid ClearBooks ISO country codes
const VALID_COUNTRY_CODES = new Set(['AD','AE','AF','AG','AI','AL','AM','AN','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZR','ZW']);

function normaliseCountry(val) {
  if (!val) return null;
  const v = val.toString().trim();
  if (!v) return null;
  // Pehle COUNTRY_MAP mein check karo (UK → GB, India → IN etc.)
  const mapped = COUNTRY_MAP[v.toLowerCase()];
  if (mapped) return mapped;
  // Phir 2-letter code check karo — sirf valid ClearBooks codes accept karo
  const upper = v.toUpperCase();
  if (v.length === 2 && VALID_COUNTRY_CODES.has(upper)) return upper;
  // Invalid hai — null return karo (address mein countryCode mat bhejo)
  return null;
}

function buildPayload(row) {
  const payload = { name: row.name.trim() };

  if (row.email)         payload.email         = row.email.trim();
  if (row.phone)         payload.phone         = row.phone.toString().trim();
  if (row.vatNumber)     payload.vatNumber     = row.vatNumber.toString().trim();
  if (row.companyNumber) payload.companyNumber = row.companyNumber.toString().trim();
  if (row.externalId)    payload.externalId    = row.externalId.toString().trim();

  if (row.contactName && row.contactName.trim()) {
    const parts  = row.contactName.trim().split(' ');
    const titles = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof'];
    if (titles.includes(parts[0].toLowerCase().replace('.', ''))) {
      payload.contactName = {
        title:     parts[0],
        forenames: parts.slice(1, -1).join(' ') || undefined,
        surname:   parts[parts.length - 1],
      };
    } else if (parts.length >= 2) {
      payload.contactName = {
        forenames: parts.slice(0, -1).join(' '),
        surname:   parts[parts.length - 1],
      };
    } else {
      payload.contactName = { surname: parts[0] };
    }
  }

  const str = (v) => (v != null && v !== '') ? v.toString().trim() : null;
  const address = {
    ...(str(row.address_building) && { building: str(row.address_building) }),
    ...(str(row.address_line1)    && { line1:    str(row.address_line1) }),
    ...(str(row.address_line2)    && { line2:    str(row.address_line2) }),
    ...(str(row.address_town)     && { town:     str(row.address_town) }),
    ...(str(row.address_county)   && { county:   str(row.address_county) }),
    ...(str(row.address_postcode) && { postcode: str(row.address_postcode) }),
  };

  // countryCode sirf tab bhejo jab koi address field ho ya country explicitly di ho
  const hasAnyAddressField = Object.keys(address).length > 0;
  const countryVal = row.address_countryCode ? row.address_countryCode.toString().trim() : null;
  if (hasAnyAddressField || countryVal) {
    const code = normaliseCountry(countryVal);
    if (code && code.length === 2) {
      address.countryCode = code;
    }
  }

  // Address object sirf tab bhejo jab kuch fields hon
  if (Object.keys(address).length > 0) {
    payload.address = address;
  }

  return payload;
}

export async function getSuppliers(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get('/accounting/suppliers', {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const suppliers = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

export async function createSupplier(req, res) {
  const { businessId, ...rest } = req.body;
  if (!rest.name) return res.status(400).json({ success: false, message: 'name is required.' });
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post('/accounting/suppliers', buildPayload(rest));
    return res.status(201).json({ success: true, message: 'Supplier created.', data });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

export async function bulkCreateSuppliers(req, res) {
  const { businessId, suppliers } = req.body;
  if (!Array.isArray(suppliers) || suppliers.length === 0)
    return res.status(400).json({ success: false, message: 'suppliers array is required.' });

  const api = getApiClient(req.session.accessToken, businessId);
  const created = [], failed = [];

  for (const row of suppliers) {
    try {
      const { data } = await api.post('/accounting/suppliers', buildPayload(row));
      created.push(data);
      console.log('[Bulk Supplier] Created:', row.name);
    } catch (err) {
      const { message } = parseAxiosError(err);
      failed.push({ row, reason: message });
      console.error('[Bulk Supplier] Failed:', row.name, message);
    }
  }

  return res.status(200).json({
    success: true,
    summary: { total: suppliers.length, created: created.length, failed: failed.length },
    created, failed,
  });
}

export async function exportSuppliers(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    let allSuppliers = [], page = 1, totalPages = 1;
    do {
      const { data, headers } = await api.get('/accounting/suppliers', { params: { limit: 200, page } });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      allSuppliers = [...allSuppliers, ...list];
      totalPages = parseInt(headers['x-pagination-total-pages'] || '1');
      page++;
    } while (page <= totalPages);
    return res.status(200).json({ success: true, count: allSuppliers.length, data: allSuppliers });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}