// ── Valid ClearBooks country codes ────────────────────────────────────────
const VALID_COUNTRY_CODES = new Set(['AD','AE','AF','AG','AI','AL','AM','AN','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZR','ZW']);

const COUNTRY_MAP = {
  'india':'IN','united kingdom':'GB','uk':'GB','england':'GB',
  'united states':'US','usa':'US','us':'US','canada':'CA',
  'australia':'AU','germany':'DE','france':'FR','spain':'ES',
  'italy':'IT','netherlands':'NL','singapore':'SG','uae':'AE',
};

export function normaliseCountry(val) {
  if (!val) return null;
  const v = val.toString().trim();
  if (!v) return null;
  const mapped = COUNTRY_MAP[v.toLowerCase()];
  if (mapped) return mapped;
  const upper = v.toUpperCase();
  if (v.length === 2 && VALID_COUNTRY_CODES.has(upper)) return upper;
  return null;
}

// ── Parse row from CSV/Excel ──────────────────────────────────────────────
export function parseRow(row, index, type = 'customers') {
  const get = (key) => {
    const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === key.toLowerCase());
    return found ? row[found]?.toString().trim() : '';
  };

  if (type === 'stockItems') {
    return {
      name:              get('name')         || get('item_name')    || get('stock_name'),
      sku:               get('sku')          || get('display_sku')  || get('code') || get('item_code'),
      type:              get('type'),
      description:       get('description')  || get('desc'),
      sale_price:        get('sale_price')   || get('selling_price'),
      sales_account:     get('sales_account')|| get('sale_account_code'),
      sale_vat_rate:     get('sale_vat_rate')|| get('sales_vat_rate'),
      sale_qty:          get('sale_qty')     || get('sales_qty'),
      cost_price:        get('cost_price')   || get('purchase_price'),
      purchases_account: get('purchases_account') || get('purchase_account_code'),
      purchases_vat_rate:get('purchases_vat_rate') || get('purchase_vat_rate'),
      purchases_qty:     get('purchases_qty'),
      is_stock_item:     get('is_stock_item')|| get('track_stock'),
      stock_balance:     get('stock_balance'),
      _rowNum: index + 2,
    };
  }

  if (type === 'journals') {
    return {
      journal_ref:      get('journal_ref')     || get('ref'),
      accounting_date:  get('accounting_date') || get('date'),
      description:      get('description')     || get('journal_description'),
      account_code:     get('account_code')    || get('accountcode'),
      amount:           get('amount'),
      line_description: get('line_description')|| get('line_desc'),
      _rowNum: index,
    };
  }

  return {
    name:                get('company_name') || get('name'),
    contactName:         get('contact_name'),
    email:               get('email'),
    phone:               get('phone1') || get('phone'),
    vatNumber:           get('vat_number') || get('vatnumber'),
    companyNumber:       get('company_number'),
    address_building:    get('building'),
    address_line1:       get('address1') || get('address_line1'),
    address_line2:       get('address2') || get('address_line2'),
    address_town:        get('town')     || get('address_town'),
    address_county:      get('county')   || get('address_county'),
    address_postcode:    get('postcode') || get('address_postcode'),
    address_countryCode: normaliseCountry(get('country') || get('address_countrycode')),
    _rowNum: index + 2,
  };
}