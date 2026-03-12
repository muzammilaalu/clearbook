import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

export async function getAccountCodes(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    let allCodes = [], page = 1, totalPages = 1;
    do {
      const { data, headers } = await api.get('/accounting/accountCodes', {
        params: { limit: 200, page },
      });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      allCodes = [...allCodes, ...list];
      totalPages = parseInt(headers['x-pagination-total-pages'] || '1');
      page++;
    } while (page <= totalPages);
    return res.status(200).json({ success: true, count: allCodes.length, data: allCodes });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

export async function getVatRates(req, res) {
  const { businessId } = req.query;
  try {
    const api = getApiClient(req.session.accessToken, businessId);
    const { data } = await api.get('/accounting/vatRates');
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    return res.status(status).json({ success: false, error: message });
  }
}

