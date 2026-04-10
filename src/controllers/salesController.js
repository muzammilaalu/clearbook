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
export async function getSalesAttachments(req, res) {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ success: false, error: 'businessId is required' });

  try {
    const api = getApiClient(req.session.accessToken, businessId);

    const { data: salesData } = await api.get('/accounting/sales/invoices', {
      params: { limit: 200, page: 1 },
    });
    const invoices = Array.isArray(salesData) ? salesData : (salesData?.data ?? []);

    if (invoices.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

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
              invoice_date:     inv.date || inv.invoiceDate || inv.invoice_date || '',
              invoice_due_date: inv.dateDue || inv.dueDate || inv.due_date || '',
              invoice_total:    inv.gross ?? inv.total ?? '',
              invoice_status:   inv.status || '',
              att_id:           att.id,
              att_name:         att.name || '',
              att_size:         att.size ?? '',
              att_uploaded:     att.dateUploaded || att.date_uploaded || '',
            }));
          } catch {
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

// POST /sales/attachments/upload
export async function uploadSalesAttachment(req, res) {
  const { businessId } = req.query;
  const { rows } = req.body;

  if (!businessId)
    return res.status(400).json({ success: false, error: 'businessId is required' });
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ success: false, error: 'rows array is required' });

  try {
    const api = getApiClient(req.session.accessToken, businessId);

    const { data: salesData } = await api.get('/accounting/sales/invoices', {
      params: { limit: 200, page: 1 },
    });
    const invoices = Array.isArray(salesData) ? salesData : (salesData?.data ?? []);

    const refMap = {};
    invoices.forEach(inv => {
      if (inv.reference)               refMap[inv.reference.trim()]               = inv.id;
      if (inv.formattedDocumentNumber) refMap[inv.formattedDocumentNumber.trim()] = inv.id;
      if (inv.documentNumber)          refMap[inv.documentNumber.trim()]           = inv.id;
      refMap[String(inv.id)] = inv.id;
    });

    const summary = { total: rows.length, created: 0, failed: 0 };
    const errors  = [];

    for (const row of rows) {
      const { invoice_ref, file_name, file_data_base64 } = row;

      if (!invoice_ref || !file_name || !file_data_base64) {
        summary.failed++;
        errors.push({ invoice_ref, file_name, error: 'Missing required fields' });
        continue;
      }

      const invoiceId = refMap[invoice_ref?.toString().trim()];
      if (!invoiceId) {
        summary.failed++;
        errors.push({ invoice_ref, file_name, error: `Invoice not found for ref: ${invoice_ref}` });
        continue;
      }

      try {
        const fileBuffer = Buffer.from(file_data_base64, 'base64');
        const safeName   = encodeURIComponent(file_name);

        await api.post(
          `/accounting/sales/invoices/${invoiceId}/attachments/${safeName}`,
          fileBuffer,
          {
            headers: {
              'Content-Type':   'application/octet-stream',
              'Content-Length': fileBuffer.length,
            },
          }
        );
        summary.created++;
      } catch (err) {
        const { message } = parseAxiosError(err);
        summary.failed++;
        errors.push({ invoice_ref, file_name, error: message });
      }
    }

    return res.status(200).json({ success: true, summary, errors });

  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

// ── GET /sales/refunds?businessId=xxx ─────────────────────────────────────
// Fetch all payments with negative amount = refunds
export async function getRefundPayments(req, res) {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ success: false, error: 'businessId is required' });

  try {
    const api = getApiClient(req.session.accessToken, businessId);

    let allPayments = [];
    let page = 1;
    let totalPages = 1;

    // ── Fetch all pages ───────────────────────────────────────────────────
    do {
      const response = await api.get('/accounting/payments', {
        params: { limit: 200, page },
      });

      const payments = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? []);

      allPayments.push(...payments);

      totalPages = parseInt(response.headers['x-pagination-total-pages'] || '1');
      page++;

    } while (page <= totalPages);

    // ── Filter negative amounts = refunds ─────────────────────────────────
    const refunds = allPayments.filter(p => Number(p.amount) < 0);

    return res.status(200).json({
      success: true,
      count:   refunds.length,
      data:    refunds,
    });

  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Sales] getRefundPayments error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}