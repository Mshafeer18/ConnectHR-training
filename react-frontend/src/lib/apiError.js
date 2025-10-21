// src/lib/apiError.js
/**
 * parseError(err)
 * Accepts:
 *  - axios Error (or axios-wrapped Error)
 *  - Error wrapper thrown by api.js (with .normalized property)
 * Returns: { status, message, errors, raw }
 */
export function parseError(err) {
  if (!err) return { status: null, message: 'Unknown error', errors: null, raw: err };

  // If the error carries normalized info (we attach it in api.js)
  if (err.normalized) return err.normalized;

  // If axios error without wrapper (defensive)
  if (err.isAxiosError) {
    const resp = err.response;
    const data = resp?.data;
    const status = resp?.status || null;
    const message =
      data?.message ||
      (typeof data === 'string' ? data : null) ||
      err.message ||
      'Request failed';
    const errors = data?.errors || null;
    return { status, message, errors, raw: err };
  }

  // fallback generic Error
  return { status: null, message: err.message || 'Unknown error', errors: null, raw: err };
}
