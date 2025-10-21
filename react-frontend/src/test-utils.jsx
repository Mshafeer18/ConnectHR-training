// src/__tests__/test-utils.jsx
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

// Mock HeaderContext provider — components call useHeaderActions which we mock in tests
export const MockHeaderProvider = ({ children }) => {
  // simple provider pass-through (the module './HeaderContext' is jests-mocked in tests)
  return <>{children}</>;
};

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MockHeaderProvider>{ui}</MockHeaderProvider>
    </MemoryRouter>
  );
}
