// // src/controllers/customerController.js
// // Docs: GET/POST https://api.clearbooks.co.uk/v1/accounting/customers
// // businessId passed via X-Business-ID header

// import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// // GET /customers?businessId=154839
// export async function getCustomers(req, res) {
//   const { businessId } = req.query;

//   try {
//     const api = getApiClient(req.session.accessToken, businessId);
//     const { data } = await api.get('/accounting/customers', {
//       params: {
//         limit: req.query.limit || 50,
//         page:  req.query.page  || 1,
//       },
//     });

//     const customers = Array.isArray(data) ? data : (data?.data ?? []);
//     return res.status(200).json({ success: true, count: customers.length, data: customers });
//   } catch (err) {
//     const { status, message } = parseAxiosError(err);
//     console.error('[Customers] getCustomers error:', message);
//     return res.status(status).json({ success: false, error: message });
//   }
// }

// // POST /customers
// // Body: { businessId, name, email, phone, address }
// // Docs: POST https://api.clearbooks.co.uk/v1/accounting/customers
// // Required fields: name
// export async function createCustomer(req, res) {
//   const { businessId, name, email, phone, address } = req.body;

//   if (!name) {
//     return res.status(400).json({
//       success: false,
//       error:   'validation_error',
//       message: 'name is required.',
//     });
//   }

//   try {
//     const api = getApiClient(req.session.accessToken, businessId);

//     const payload = {
//       name,
//       ...(email   && { email }),
//       ...(phone   && { phone }),
//       ...(address && { address }),
//     };

//     const { data } = await api.post('/accounting/customers', payload);
//     return res.status(201).json({
//       success: true,
//       message: 'Customer created successfully.',
//       data:    data?.data ?? data,
//     });
//   } catch (err) {
//     const { status, message } = parseAxiosError(err);
//     console.error('[Customers] createCustomer error:', message);
//     return res.status(status).json({ success: false, error: message });
//   }
// }



// src/controllers/customerController.js
// ClearBooks API: POST /accounting/customers
// Docs confirmed fields: name, email, phone, contactName, vatNumber, creditLimit, address{}





// src/controllers/customerController.js
// ClearBooks API: POST /accounting/customers
// Docs confirmed fields: name, email, phone, contactName, vatNumber, creditLimit, address{}


import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// Country name to ISO 2-letter code map
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
  // Invalid hai — null return karo
  return null;
}

// ── Build exact ClearBooks payload ────────────────────────────────────────
// Permitted fields: name, email, phone, contactName (object), address,
//                   vatNumber, companyNumber, externalId, archived
function buildPayload(row) {
  const payload = {
    name: row.name.trim(),
  };

  if (row.email)         payload.email         = row.email.trim();
  if (row.phone)         payload.phone         = row.phone.toString().trim();
  if (row.vatNumber)     payload.vatNumber     = row.vatNumber.toString().trim();
  if (row.companyNumber) payload.companyNumber = row.companyNumber.toString().trim();

  // contactName must be an OBJECT {title, forenames, surname}
  if (row.contactName && row.contactName.trim()) {
    const parts = row.contactName.trim().split(' ');
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

  // Billing address
  const str = (v) => (v != null && v !== '') ? v.toString().trim() : null;
  const address = {
    ...(str(row.address_building)    && { building:    str(row.address_building) }),
    ...(str(row.address_line1)       && { line1:       str(row.address_line1) }),
    ...(str(row.address_line2)       && { line2:       str(row.address_line2) }),
    ...(str(row.address_town)        && { town:        str(row.address_town) }),
    ...(str(row.address_county)      && { county:      str(row.address_county) }),
    ...(str(row.address_postcode)    && { postcode:    str(row.address_postcode) }),
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

// ── GET /customers ────────────────────────────────────────────────────────
export async function getCustomers(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get('/accounting/customers', {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const customers = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// ── POST /customers — single ──────────────────────────────────────────────
export async function createCustomer(req, res) {
  const { businessId, ...rest } = req.body;
  if (!rest.name) {
    return res.status(400).json({ success: false, message: 'name is required.' });
  }
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post('/accounting/customers', buildPayload(rest));
    return res.status(201).json({ success: true, message: 'Customer created.', data });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// ── POST /customers/bulk ──────────────────────────────────────────────────
export async function bulkCreateCustomers(req, res) {
  const { businessId, customers } = req.body;

  if (!Array.isArray(customers) || customers.length === 0) {
    return res.status(400).json({ success: false, message: 'customers array is required.' });
  }

  const api     = getApiClient(req.session.accessToken, businessId);
  const created = [];
  const failed  = [];

  for (const row of customers) {
    try {
      const { data } = await api.post('/accounting/customers', buildPayload(row));
      created.push(data);
      console.log(`[Bulk] ✅ Created: ${row.name}`);
    } catch (err) {
      const { message } = parseAxiosError(err);
      failed.push({ row, reason: message });
      console.error(`[Bulk]❌ Failed: ${row.name} —`, message);
    }
  }

  return res.status(200).json({
    success: true,
    summary: { total: customers.length, created: created.length, failed: failed.length },
    created,
    failed,
  });
}

// ── GET /customers/export — saare customers fetch karke Excel download ────
export async function exportCustomers(req, res) {
  const { businessId } = req.query;

  try {
    const api = getApiClient(req.session.accessToken, businessId);

    // Saare pages fetch karo
    let allCustomers = [];
    let page = 1;
    let totalPages = 1;

    do {
      const { data, headers } = await api.get('/accounting/customers', {
        params: { limit: 200, page },
      });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      allCustomers = [...allCustomers, ...list];
      totalPages = parseInt(headers['x-pagination-total-pages'] || '1');
      page++;
    } while (page <= totalPages);

    // JSON response bhejo — frontend Excel banega
    return res.status(200).json({
      success: true,
      count: allCustomers.length,
      data: allCustomers,
    });

  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Customers] exportCustomers error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}