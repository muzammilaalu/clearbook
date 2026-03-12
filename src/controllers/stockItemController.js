import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// ─── Type normaliser ─────────────────────────────────────────────────────────
function normaliseType(val, row) {
  if (val) {
    const v = val.toString().toLowerCase().trim();
    if (v === 'both' || v === 'sales' || v === 'purchases') return v;
    if (v === 'sale') return 'sales';
    if (v === 'purchase') return 'purchases';
  }
  const isStock = row.is_stock_item?.toString().toLowerCase();
  if (isStock === 'true' || isStock === 'yes' || isStock === '1') return 'both';
  const hasS = parseFloat(row.sale_qty) > 0 || parseFloat(row.salesQuantity) > 0;
  const hasP = parseFloat(row.purchases_qty) > 0 || parseFloat(row.purchaseQuantity) > 0;
  if (hasS && hasP) return 'both';
  if (hasS) return 'sales';
  if (hasP) return 'purchases';
  return 'both';
}


// ─── VAT Rate normaliser ─────────────────────────────────────────────────────
// ClearBooks format: "rate:treatment"  e.g.  "20.00:Standard", "0.00:Zero", "0.00:Out"
// Common inputs from CSV: "20%", "20", "standard", "20:standard", etc.
const VAT_MAP = {
  '20':         '20.00:Standard',
  '20%':        '20.00:Standard',
  '20.00':      '20.00:Standard',
  'standard':   '20.00:Standard',
  '20standard': '20.00:Standard',
  '5':          '5.00:Reduced',
  '5%':         '5.00:Reduced',
  '5.00':       '5.00:Reduced',
  'reduced':    '5.00:Reduced',
  '0':          '0.00:Zero',
  '0%':         '0.00:Zero',
  '0.00':       '0.00:Zero',
  'zero':       '0.00:Zero',
  'exempt':     '0.00:Exempt',
  'out':        '0.00:Out',
  'outside':    '0.00:Out',
  'out of scope':'0.00:Out',
};

function normaliseVatRate(val) {
  if (!val) return null;
  const v = val.toString().trim();
  if (!v) return null;
  // Already in correct format "XX.XX:Treatment"
  if (/^\d+(\.\d+)?:[A-Za-z]+$/.test(v)) return v;
  // Try lookup (lowercase, no spaces)
  const key = v.toLowerCase().replace(/\s+/g, '');
  if (VAT_MAP[key]) return VAT_MAP[key];
  // Try "20:standard" → "20.00:Standard"
  const match = v.match(/^(\d+(?:\.\d+)?):(.+)$/);
  if (match) {
    const rate = parseFloat(match[1]).toFixed(2);
    const treatment = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
    return `${rate}:${treatment}`;
  }
  return null; // unrecognised — don't send, avoid 422
}

// ─── Payload builder ─────────────────────────────────────────────────────────
function buildPayload(row) {
  const str  = (v) => (v != null && v !== '') ? v.toString().trim() : null;
  const num  = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const int  = (v) => { const n = parseInt(v);   return isNaN(n) ? null : n; };
  const bool = (v) => v === true || v?.toString().toLowerCase() === 'true' || v === '1' || v === 'yes';

  const payload = {
    name: str(row.name),
    type: normaliseType(row.type, row),
  };

  if (str(row.sku))                                          payload.sku                 = str(row.sku);
  if (str(row.description))                                  payload.description         = str(row.description);

  // Sales
  const salePrice = num(row.sale_price    ?? row.salesUnitPrice);
  if (salePrice != null)                                     payload.salesUnitPrice      = salePrice;
  const saleAcc   = int(row.sales_account ?? row.salesAccountCode);
  if (saleAcc != null && saleAcc > 0)                        payload.salesAccountCode    = saleAcc;
  const saleVat   = normaliseVatRate(row.sale_vat_rate ?? row.salesVatRateKey);
  if (saleVat)                                               payload.salesVatRateKey     = saleVat;
  const saleQty   = num(row.sale_qty      ?? row.salesQuantity);
  if (saleQty != null)                                       payload.salesQuantity       = saleQty;

  // Purchases
  const costPrice  = num(row.cost_price        ?? row.purchaseUnitPrice);
  if (costPrice != null)                                     payload.purchaseUnitPrice   = costPrice;
  const purchAcc   = int(row.purchases_account ?? row.purchaseAccountCode);
  if (purchAcc != null && purchAcc > 0)                      payload.purchaseAccountCode = purchAcc;
  const purchVat   = normaliseVatRate(row.purchases_vat_rate ?? row.purchaseVatRateKey);
  if (purchVat)                                              payload.purchaseVatRateKey  = purchVat;
  const purchQty   = num(row.purchases_qty     ?? row.purchaseQuantity);
  if (purchQty != null)                                      payload.purchaseQuantity    = purchQty;

  // Track stock
  const trackVal = row.is_stock_item ?? row.trackStock;
  if (trackVal != null) payload.trackStock = bool(trackVal);

  return payload;
}

// ─── GET all stock items ──────────────────────────────────────────────────────
export async function getStockItems(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get('/accounting/stockItems', {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// ─── POST single stock item ───────────────────────────────────────────────────
export async function createStockItem(req, res) {
  const { businessId, ...rest } = req.body;
  if (!rest.name) return res.status(400).json({ success: false, message: 'name is required.' });
  if (!rest.type) return res.status(400).json({ success: false, message: 'type is required (purchases/sales/both).' });
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post('/accounting/stockItems', buildPayload(rest));
    return res.status(201).json({ success: true, message: 'Stock item created.', data });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// ─── POST bulk stock items ────────────────────────────────────────────────────
export async function bulkCreateStockItems(req, res) {
  const { businessId, stockItems } = req.body;
  if (!Array.isArray(stockItems) || stockItems.length === 0)
    return res.status(400).json({ success: false, message: 'stockItems array is required.' });

  const api = getApiClient(req.session.accessToken, businessId);
  const created = [], failed = [];

  for (const row of stockItems) {
    try {
      const payload = buildPayload(row);
      const { data } = await api.post('/accounting/stockItems', payload);
      created.push(data);
      console.log('[Bulk Stock] Created:', row.name, '| type:', payload.type);
    } catch (err) {
      const { message } = parseAxiosError(err);
      failed.push({ row, reason: message });
      console.error('[Bulk Stock] Failed:', row.name, message);
    }
  }

  return res.status(200).json({
    success: true,
    summary: { total: stockItems.length, created: created.length, failed: failed.length },
    created, failed,
  });
}

// ─── GET export (all pages) ───────────────────────────────────────────────────
export async function exportStockItems(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    let allItems = [], page = 1, totalPages = 1;
    do {
      const { data, headers } = await api.get('/accounting/stockItems', { params: { limit: 200, page } });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      allItems = [...allItems, ...list];
      totalPages = parseInt(headers['x-pagination-total-pages'] || '1');
      page++;
    } while (page <= totalPages);
    return res.status(200).json({ success: true, count: allItems.length, data: allItems });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}