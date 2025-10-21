// src/components/StudentList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';
import { useHeaderActions } from './HeaderContext';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const navigate = useNavigate();
  const { setRightNode } = useHeaderActions();

  useEffect(() => {
    fetchStudents();
  }, []);

  // set a Logout button in the header while this page is active
  useEffect(() => {
    const logout = async () => {
      if (!window.confirm('Logout from the application?')) return;
      try {
        try { await api.post('/logout'); } catch (e) { /* ignore */ }
      } finally {
        setAuthToken(null);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    const node = (
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
      >
        Logout
      </button>
    );

    setRightNode(node);
    return () => setRightNode(null);
  }, [setRightNode, navigate]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data?.data || []);
    } catch (err) {
      console.error(err);
      const { parseError } = await import('../lib/apiError');
      const e = parseError(err);
      setMessage({ type: 'error', text: e.message || 'Failed to load students.' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setMessage({ type: 'success', text: 'Student deleted.' });
      fetchStudents();
    } catch (err) {
      console.error(err);
      const { parseError } = await import('../lib/apiError');
      const e = parseError(err);
      setMessage({ type: 'error', text: e.message || 'Failed to delete student.' });
    }
  };

  const handleExport = async () => {
    setLoadingExport(true);
    setMessage(null);
    try {
      const res = await api.get('/students/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.data.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']);
      let filename = 'students.xlsx';
      if (disposition) {
        const match = disposition.match(/filename=\"?(.+?)\"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Export started.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Export failed.' });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleImportChange = (e) => setImportFile(e.target.files[0] || null);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setMessage({ type: 'error', text: 'Please choose a CSV or XLSX file.' });
      return;
    }

    setImporting(true);
    setMessage(null);
    const form = new FormData();
    form.append('file', importFile);

    try {
      const res = await api.post('/students/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage({ type: 'success', text: res.data?.message || 'Import successful.' });
      setImportFile(null);
      const input = document.getElementById('students-import-input');
      if (input) input.value = '';
      fetchStudents();
    } catch (err) {
      console.error(err);
      const { parseError } = await import('../lib/apiError');
      const e = parseError(err);
      const text = e.errors ? Object.values(e.errors).flat().join(' ') : e.message || 'Import failed. Check file format and columns.';
      setMessage({ type: 'error', text });
    } finally {
      setImporting(false);
    }
  };

  // helper to get initials (max 2 letters)
  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
            <p className="text-sm text-gray-500">Manage your students — create, edit, import and export.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/students/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 focus:outline-none"
            >
              New Student
            </button>

            <button
              onClick={handleExport}
              disabled={loadingExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none disabled:opacity-60"
            >
              {loadingExport ? 'Preparing...' : 'Export XLSX'}
            </button>

            {/* Logout moved to header slot via HeaderContext - removed duplicate button here */}
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-green-50 border border-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleImportSubmit} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              id="students-import-input"
              type="file"
              accept=".csv, .xlsx"
              onChange={handleImportChange}
              className="block w-full sm:w-auto text-sm text-gray-600 file:border file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100"
            />

            <button type="submit" disabled={importing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-60">
              {importing ? 'Importing...' : 'Import CSV/XLSX'}
            </button>

            <div className="text-sm text-gray-500 ml-auto">Tip: CSV/XLSX with columns <span className="font-medium">name, email, age, photo_url</span></div>
          </form>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Age</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loadingStudents ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No students found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{s.id}</td>
                    <td className="px-4 py-3">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt={s.name} className="w-14 h-14 rounded-full object-cover border" />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium uppercase"
                          aria-hidden="true"
                          title={s.name}
                        >
                          {getInitials(s.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.age ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-right space-x-2">
                      <button onClick={() => navigate(`/students/${s.id}`)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-50">View</button>
                      <button onClick={() => navigate(`/students/${s.id}/edit`)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-yellow-100 text-sm hover:bg-yellow-200">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-sm hover:bg-red-100">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
