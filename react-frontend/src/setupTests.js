// src/setupTests.js
import '@testing-library/jest-dom';

// Ensure URL.createObjectURL / revokeObjectURL exist in JSDOM
if (typeof global.URL === 'undefined') global.URL = {};
if (typeof global.URL.createObjectURL !== 'function') {
  global.URL.createObjectURL = () => 'blob:placeholder';
}
if (typeof global.URL.revokeObjectURL !== 'function') {
  global.URL.revokeObjectURL = () => {};
}

// Silence only the React Router future-flag warnings in tests
const _origWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) return;
    _origWarn(...args);
  };
});
afterAll(() => {
  console.warn = _origWarn;
});

// Filter a specific expected console.error noise that comes from a mocked failed login response.
// Keep the rest of console.error behavior untouched so real test errors still surface.
const _origError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    try {
      // If the first arg is an object that looks like { response: { data: { message: 'Invalid creds' } } }
      const first = args[0];
      if (
        first &&
        typeof first === 'object' &&
        first.response &&
        first.response.data &&
        typeof first.response.data.message === 'string' &&
        // match the exact message or a substring — adjust if your mock message changes
        first.response.data.message.toLowerCase().includes('invalid cred')
      ) {
        // swallow this expected test noise
        return;
      }
    } catch (e) {
      // if our filter throws for any reason, fall back to original error handler
    }
    _origError(...args);
  };
});
afterAll(() => {
  console.error = _origError;
});
