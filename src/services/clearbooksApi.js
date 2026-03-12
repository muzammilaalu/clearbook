import axios from 'axios';

const BASE_URL = 'https://api.clearbooks.co.uk/v1';

export function getApiClient(accessToken, businessId = null) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
      ...(businessId && { 'X-Business-ID': String(businessId) }),
    },
  });
}

// ── Extract real ClearBooks API error messages ────────────────────────────
// ClearBooks returns: { errors: [{ errorCode, errorMessage, source }] }
export function extractApiErrors(err) {
  const data = err?.response?.data;
  const status = err?.response?.status;

  // ClearBooks 422: { errors: [{ errorCode, errorMessage, source }] }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map(e => {
        const code  = e.errorCode    ? `[${e.errorCode}]` : '';
        const msg   = e.errorMessage || e.message || JSON.stringify(e);
        const clean = msg.replace(/<[^>]*>/g, '').trim();
        return `${code} ${clean}`.trim();
      })
      .join(' | ');
  }

  // Sometimes errors is directly an array at root
  if (Array.isArray(data) && data.length > 0 && data[0]?.errorMessage) {
    return data.map(e => {
      const code  = e.errorCode ? `[${e.errorCode}]` : '';
      const clean = (e.errorMessage || '').replace(/<[^>]*>/g, '').trim();
      return `${code} ${clean}`.trim();
    }).join(' | ');
  }

  // Single message fields
  if (data?.message) return data.message;
  if (data?.error)   return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
  if (data?.title)   return data.title;

  // Fallback — return full response body as string
  if (data) return JSON.stringify(data);

  return err?.message || `HTTP ${status || 'Unknown'} error`;
}

// Keep for backward compat
export function parseAxiosError(err) {
  return {
    status:  err.response?.status || 500,
    message: extractApiErrors(err),
  };
}