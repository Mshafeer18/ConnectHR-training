// src/__tests__/Login.test.jsx
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';
import { renderWithRouter } from '../test-utils';
import { fireEvent } from '@testing-library/react';

// mock react-router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock the api module (post) and setAuthToken helper
const mockSetAuthToken = jest.fn();
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  setAuthToken: (...args) => mockSetAuthToken(...args),
}));

// mock the parseError helper used by Login (dynamic import)
jest.mock('../lib/apiError', () => ({
  parseError: (err) => {
    // normalize to what your component expects: { message, errors? }
    if (err && err.response && err.response.data && err.response.data.message) {
      return { message: err.response.data.message };
    }
    if (err && err.message) {
      return { message: err.message };
    }
    return { message: 'Login failed' };
  },
}));

import api from '../api';

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful login stores token and navigates', async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } });

    renderWithRouter(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    // restrict to input element to avoid matching the "Show password" button
    await userEvent.type(screen.getByLabelText(/password/i, { selector: 'input' }), 'password');

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login', expect.objectContaining({
        email: 'user@example.com',
      }));
    });

    expect(mockSetAuthToken).toHaveBeenCalledWith('fake-token');
    expect(mockNavigate).toHaveBeenCalledWith('/students', { replace: true });
  });

  test('failed login shows error', async () => {
    // realistic axios-style error object
    const serverErr = new Error('Request failed');
    serverErr.response = { data: { message: 'Invalid creds' } };
    api.post.mockRejectedValueOnce(serverErr);

    renderWithRouter(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i, { selector: 'input' }), 'wrong');

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // wait for the component to import parseError and set the error state
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Invalid creds/i);
  });

  test('shows validation error when fields empty', async () => {
    // capture container so we can access the form element
    const { container } = renderWithRouter(<Login />);

    // disable native HTML5 validation so onSubmit will run in JSDOM
    const form = container.querySelector('form');
    expect(form).toBeTruthy(); // sanity check
    form.noValidate = true;

    // submit the form programmatically
    fireEvent.submit(form);

    // now the component's submit handler should run and display the alert
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Please enter both email and password/i);
  });
});
