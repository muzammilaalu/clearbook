// src/controllers/businessController.js

import { getApiClient, parseAxiosError } from '../services/clearbooksApi.js';

// GET /businesses
export async function getBusinesses(req, res) {
  try {
    const api = getApiClient(req.session.accessToken);
    const { data } = await api.get('/businesses');

    // ClearBooks returns array directly
    const businesses = Array.isArray(data) ? data : (data?.data ?? []);

    return res.status(200).json({
      success: true,
      count:   businesses.length,
      data:    businesses,
    });
  } catch (err) {
    const { status, message } = parseAxiosError(err);
    console.error('[Businesses] Error:', message);
    return res.status(status).json({ success: false, error: message });
  }
}