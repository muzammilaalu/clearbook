// src/controllers/salesController.js

import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// GET /sales?businessId=xxx&type=invoices
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
    return res.status(status).json({ success: false, error: message });
  }
}

// POST /sales
export async function createSale(req, res) {
  const { businessId, type = 'invoices', entity_id, invoice_date, due_date, line_items } = req.body;
  if (!entity_id || !invoice_date || !line_items?.length) {
    return res.status(400).json({ success: false, error: 'entity_id, invoice_date, and line_items are required.' });
  }
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post(`/accounting/sales/${type}`, {
      entity_id, invoice_date, ...(due_date && { due_date }), line_items,
    });
    return res.status(201).json({ success: true, data: data?.data ?? data });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// GET /sales/attachments?businessId=xxx
// Fetches ALL invoices then fetches attachments for each
export async function getSalesAttachments(req, res) {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ success: false, error: 'businessId is required' });

  try {
    const api = getApiClient(req.session.accessToken, businessId);

    // Step 1 — fetch all invoices (up to 200)
    const { data: salesData } = await api.get('/accounting/sales/invoices', {
      params: { limit: 200, page: 1 },
    });
    const invoices = Array.isArray(salesData) ? salesData : (salesData?.data ?? []);

    if (invoices.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Step 2 — fetch attachments for each invoice (parallel, max 10 at a time)
    const results = [];
    const BATCH = 10;

    for (let i = 0; i < invoices.length; i += BATCH) {
      const batch = invoices.slice(i, i + BATCH);
      const settled = await Promise.allSettled(
        batch.map(async (inv) => {
          try {
            const { data: attData } = await api.get(
              `/accounting/sales/invoices/${inv.id}/attachments`,
              { params: { limit: 200 } }
            );
            const attachments = Array.isArray(attData) ? attData : (attData?.data ?? []);
            return attachments.map(att => ({
              invoice_id:       inv.id,
              invoice_ref:      inv.reference || inv.ref || '',
              invoice_date:     inv.invoiceDate || inv.invoice_date || '',
              invoice_due_date: inv.dueDate || inv.due_date || '',
              invoice_total:    inv.total ?? '',
              invoice_status:   inv.status || '',
              att_id:           att.id,
              att_name:         att.name || '',
              att_size:         att.size ?? '',
              att_uploaded:     att.dateUploaded || att.date_uploaded || '',
            }));
          } catch {
            // Invoice has no attachments — skip silently
            return [];
          }
        })
      );
      settled.forEach(s => { if (s.status === 'fulfilled') results.push(...s.value); });
    }

    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Sales] getSalesAttachments error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}