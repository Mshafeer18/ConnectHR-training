jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  }
}));
// src/__tests__/StudentDetail.test.jsx
import React from 'react';
import { screen } from '@testing-library/react';
import StudentDetail from '../components/StudentDetail';
import { renderWithRouter } from '../test-utils';

jest.mock('../components/HeaderContext', () => ({
  useHeaderActions: () => ({ setRightNode: jest.fn() }),
}));

// mock navigate from react-router-dom used in StudentDetail's useEffect if fetch fails
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

describe('StudentDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders student details and initials when no photo', async () => {
    const student = { id: 7, name: 'John Doe', email: 'john@example.com', age: 28, photo_url: null };

    renderWithRouter(<StudentDetail student={student} />);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();

    // initials (JD) should be shown
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('renders photo when photo_url present', async () => {
    const student = { id: 8, name: 'Jane Roe', email: 'jane@example.com', age: 24, photo_url: '/media/jane.png' };

    renderWithRouter(<StudentDetail student={student} />);

    const img = await screen.findByAltText('Jane Roe');
    expect(img).toBeInTheDocument();
    // src should resolve (component prefixes base URL if needed)
    expect(img.getAttribute('src')).toContain('media/jane.png');
  });
});
