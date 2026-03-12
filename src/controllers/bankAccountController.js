// src/controllers/bankAccountController.js
// Docs: GET https://api.clearbooks.co.uk/v1/accounting/bankAccounts

import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// GET /bank-accounts?businessId=154839
export async function getBankAccounts(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get('/accounting/bankAccounts', {
      params: { limit: req.query.limit || 50, page: req.query.page || 1 },
    });
    const accounts = Array.isArray(data) ? data : (data?.data ?? []);
    return res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[BankAccounts] error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}