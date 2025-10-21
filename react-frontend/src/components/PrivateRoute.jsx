// Simple wrapper to protect routes
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('api_token');
  return token ? children : <Navigate to="/login" replace />;
}
