// src/api.js
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// set/unset Authorization header and persist token
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('api_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('api_token');
    delete api.defaults.headers.common['Authorization'];
  }
}

// initialize from stored token (on app start)
const _token = localStorage.getItem('api_token');
if (_token) setAuthToken(_token);

/**
 * Normalize axios error into: { status, message, errors, raw }
 */
function normalizeAxiosError(err) {
  const out = { status: null, message: 'Network error', errors: null, raw: err };

  if (!err || !err.isAxiosError) {
    // not axios error (could be our thrown Error wrapper) — try to read .normalized
    if (err && err.normalized) return err.normalized;
    return out;
  }

  const resp = err.response;
  out.status = resp?.status || null;

  // Try to read message from common locations
  const data = resp?.data;
  if (data) {
    if (typeof data === 'string') out.message = data;
    else out.message = data?.message || data?.msg || out.message;

    // validation object
    out.errors = data?.errors || data?.error || null;

    // some resources return nested data e.g. { data: {...} }
    if (!out.errors && data?.data?.errors) out.errors = data.data.errors;
  } else {
    // no response (network failure)
    out.message = err.message || out.message;
  }

  return out;
}

// global response interceptor (normalizes errors, handles 401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const normalized = normalizeAxiosError(err);

    if (normalized.status === 401) {
      // token invalid/expired — clear and redirect to login
      setAuthToken(null);
      // immediate redirect (frontend already uses this behavior)
      window.location.href = '/login';
      // still return a rejected promise so callers can handle if needed
    }

    // create an Error wrapper with normalized info so downstream can parse easily
    const wrapper = new Error(normalized.message || 'API error');
    wrapper.normalized = normalized;
    return Promise.reject(wrapper);
  }
);

// convenience helper for multipart form posts
export const postForm = (url, formData, config = {}) =>
  api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...config });

export default api;
