// src/controllers/salesController.js
// Docs: GET/POST https://api.clearbooks.co.uk/v1/accounting/sales/{type}
// type = invoices | quotes | credit-notes | etc.

import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// GET /sales?businessId=154839&type=invoices
export async function getSales(req, res) {
  const { businessId, type = 'invoices' } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get(`/accounting/sales/${type}`, {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const sales = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Sales] getSales error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}

// POST /sales
// Body: { businessId, type, entity_id, invoice_date, due_date, line_items }
export async function createSale(req, res) {
  const { businessId, type = 'invoices', entity_id, invoice_date, due_date, line_items } = req.body;

  if (!entity_id || !invoice_date || !line_items?.length) {
    return res.status(400).json({
      success: false,
      error:   'validation_error',
      message: 'entity_id, invoice_date, and line_items are required.',
    });
  }

  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post(`/accounting/sales/${type}`, {
      entity_id,
      invoice_date,
      ...(due_date && { due_date }),
      line_items,
    });
    return res.status(201).json({
      success: true,
      message: 'Sales document created successfully.',
      data:    data?.data ?? data,
    });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Sales] createSale error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}