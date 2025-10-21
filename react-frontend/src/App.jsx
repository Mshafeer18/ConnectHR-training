// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import StudentForm from './components/StudentForm';
import Login from './components/Login';
import Layout from './components/Layout';
import './index.css';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected routes wrapped by PrivateRoute and Layout (header + footer) */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          {/* default -> students */}
          <Route path="/" element={<Navigate to="/students" replace />} />

          {/* students listing */}
          <Route path="/students" element={<StudentList />} />

          {/* view a single student (reload-safe) */}
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/students/:id/edit" element={<StudentForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
