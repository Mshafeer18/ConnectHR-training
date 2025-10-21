// src/__tests__/StudentForm.test.jsx
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentForm from '../components/StudentForm';
import { renderWithRouter } from '../test-utils';

jest.mock('../components/HeaderContext', () => ({
  useHeaderActions: () => ({ setRightNode: jest.fn() }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

jest.mock('../api', () => ({
  __esModule: true,
  default: {},
  postForm: jest.fn(),
}));

import { postForm } from '../api';

describe('StudentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a new student and navigates to returned id', async () => {
    postForm.mockResolvedValueOnce({ data: { id: 123 } });
    renderWithRouter(<StudentForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'New Student');
    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/age/i), '25');

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(postForm).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/students/123', { replace: true });
    });
  });

  test('edit existing student triggers PUT and navigates back to detail', async () => {
    postForm.mockResolvedValueOnce({});

    const student = { id: 5, name: 'Edit Me', email: 'edit@example.com', age: 30 };
    renderWithRouter(<StudentForm student={student} />);

    // modify name (clear then type)
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Edited Name');

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(postForm).toHaveBeenCalledWith(`/students/5?_method=PUT`, expect.any(FormData));
      expect(mockNavigate).toHaveBeenCalledWith('/students/5', { replace: true });
    });
  });

  test('shows preview when file uploaded', async () => {
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');
    }

    const { container } = renderWithRouter(<StudentForm />);

    const file = new File(['photo'], 'photo.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"][name="photo"]');
    expect(input).toBeTruthy(); // sanity
    await userEvent.upload(input, file);

    // preview image should appear — StudentForm sets alt="preview"
    expect(await screen.findByAltText('preview')).toBeInTheDocument();

    if (global.URL.createObjectURL.mockRestore) global.URL.createObjectURL.mockRestore();
  });
});
