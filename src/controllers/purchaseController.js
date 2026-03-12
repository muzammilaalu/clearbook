// src/controllers/purchaseController.js
// Docs: GET https://api.clearbooks.co.uk/v1/accounting/purchases/{type}
// type = bills | expenses | credit-notes | etc.

import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// GET /purchases?businessId=154839&type=bills
export async function getPurchases(req, res) {
  const { businessId, type = 'bills' } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get(`/accounting/purchases/${type}`, {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const purchases = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Purchases] error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}