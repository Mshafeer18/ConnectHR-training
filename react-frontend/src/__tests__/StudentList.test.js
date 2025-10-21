// src/__tests__/StudentList.test.jsx
import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentList from '../components/StudentList';
import { renderWithRouter } from '../test-utils';

jest.mock('../components/HeaderContext', () => ({
  useHeaderActions: () => ({ setRightNode: jest.fn() }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
  },
  setAuthToken: jest.fn(),
}));

import api, { setAuthToken } from '../api';

describe('StudentList', () => {
  const students = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', age: 20, photo_url: null },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', age: 22, photo_url: null },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // default list response
    api.get.mockImplementation((url) => {
      if (url === '/students') return Promise.resolve({ data: students });
      if (url === '/students/export') {
        const blob = new Blob(['xlscontent'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return Promise.resolve({ data: blob, headers: { 'content-disposition': 'attachment; filename="students.xlsx"' }});
      }
      return Promise.resolve({ data: [] });
    });

    api.delete.mockResolvedValue({ data: { message: 'Student deleted successfully' } });
    api.post.mockResolvedValue({ data: { message: 'Import completed' } });
  });

// ... (start of file unchanged) ...

  test('render fetched students and handles delete', async () => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    renderWithRouter(<StudentList />);

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();

    const aliceRow = screen.getByText('Alice Smith').closest('tr');
    const { getByText: getByTextInAlice } = within(aliceRow);
    const deleteBtn = getByTextInAlice('Delete');
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/students/1');
    });
  });

  test('export triggers download link and uses filename from header', async () => {
    // ensure createObjectURL exists in this environment
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = jest.fn(() => 'blob:fake-url');
    } else {
      jest.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    }

    const clickSpy = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    renderWithRouter(<StudentList />);

    await screen.findByText('Alice Smith');

    await userEvent.click(screen.getByRole('button', { name: /Export XLSX/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/students/export', { responseType: 'blob' });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    // cleanup
    if (global.URL.createObjectURL.mockRestore) global.URL.createObjectURL.mockRestore();
    document.createElement.mockRestore();
  });


  test('import without file shows error message', async () => {
    renderWithRouter(<StudentList />);

    await screen.findByText('Alice Smith');

    // click import without selecting file
    userEvent.click(screen.getByRole('button', { name: /Import CSV\/XLSX/i }));

    expect(await screen.findByText(/Please choose a CSV or XLSX file/i)).toBeInTheDocument();
  });

});
