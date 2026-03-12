import { getApiClient, extractApiErrors } from '../services/clearbooksApi.js';

// ── Payload builder ───────────────────────────────────────────────────────────
function buildPayload(journal) {
  const str = (v) => (v != null && v !== '') ? v.toString().trim() : null;
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const int = (v) => { const n = parseInt(v);   return isNaN(n) ? null : n; };

  const payload = {};
  if (str(journal.accountingDate)) payload.accountingDate = str(journal.accountingDate);
  if (str(journal.description))    payload.description    = str(journal.description);

  if (Array.isArray(journal.lines)) {
    payload.lines = journal.lines
      .filter(l => {
        const id  = int(l.accountCode);
        const amt = num(l.amount);
        return id != null && !isNaN(id) && amt != null && !isNaN(amt);
      })
      .map(l => {
        const line = {
          accountCodeId: int(l.accountCode),
          amount:        num(l.amount),
        };
        if (str(l.description)) line.description = str(l.description);
        return line;
      });
  }

  return payload;
}

// ── POST single journal ───────────────────────────────────────────────────────
export async function createJournal(req, res) {
  const { businessId, ...journal } = req.body;
  if (!Array.isArray(journal.lines) || journal.lines.length === 0)
    return res.status(400).json({ success: false, message: 'lines array is required.' });

  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.post('/accounting/journals', buildPayload(journal));
    return res.status(201).json({ success: true, message: 'Journal created.', data });
  } catch (err) {
    const message = extractApiErrors(err);
    const status  = err?.response?.status || 500;
    return res.status(status).json({ success: false, error: message });
  }
}

// ── POST bulk journals ────────────────────────────────────────────────────────
export async function bulkCreateJournals(req, res) {
  const { businessId, journals } = req.body;
  if (!Array.isArray(journals) || journals.length === 0)
    return res.status(400).json({ success: false, message: 'journals array is required.' });

  const api = getApiClient(req.session.accessToken, businessId);
  const created = [], failed = [];

  for (const journal of journals) {
    if (!Array.isArray(journal.lines) || journal.lines.length === 0) {
      failed.push({ journal, reason: 'lines array is empty' });
      continue;
    }
    try {
      const { data } = await api.post('/accounting/journals', buildPayload(journal));
      created.push(data);
      console.log('[Bulk Journal] Created:', journal.description || journal.accountingDate);
    } catch (err) {
      // Capture ClearBooks actual API error messages
      const reason = extractApiErrors(err);
      failed.push({ journal, reason });
      console.error('[Bulk Journal] Failed:', journal.description, reason);
    }
  }

  return res.status(200).json({
    success: true,
    summary: { total: journals.length, created: created.length, failed: failed.length },
    created, failed,
  });
}