// src/components/StudentDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useHeaderActions } from './HeaderContext';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const StudentDetail = ({ student: propStudent = null, onClose, onEdit }) => {
  const { id } = useParams();
  const [student, setStudent] = useState(propStudent);
  const [loading, setLoading] = useState(false);
  const { setRightNode } = useHeaderActions();
  const navigate = useNavigate();

  useEffect(() => {
    // if no student prop and id is present, fetch from API
    if (!propStudent && id) {
      setLoading(true);
      api.get(`/students/${id}`)
        .then((res) => setStudent(res.data.data))
        .catch(async (err) => {
          console.error(err);
          const { parseError } = await import('../lib/apiError');
          const e = parseError(err);
          // if 404 -> go back to list, otherwise show a console error and go back
          if (e.status === 404) navigate('/students', { replace: true });
          else {
            // optionally show a message (you can add a state to show it)
            navigate('/students', { replace: true });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [propStudent, id, navigate]);

  useEffect(() => {
    // create header node with optional Edit and Back buttons
    const node = (
      <div className="flex items-center gap-2">
        {onEdit ? (
          <button
            onClick={() => onEdit?.(student)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-100 text-sm hover:bg-yellow-200 focus:outline-none"
          >
            Edit
          </button>
        ) : (
          // route-based edit button
          student && (
            <button
              onClick={() => navigate(`/students/${student.id}/edit`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-100 text-sm hover:bg-yellow-200 focus:outline-none"
            >
              Edit
            </button>
          )
        )}

        <button
          onClick={() => {
            if (typeof onClose === 'function') onClose();
            else navigate(-1);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm hover:bg-gray-50 focus:outline-none"
        >
          ← Back
        </button>
      </div>
    );

    setRightNode(node);
    return () => setRightNode(null);
  }, [setRightNode, onEdit, onClose, navigate, student]);

  const photoUrl = student?.photo_url ? resolveUrl(student.photo_url) : null;

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-500">Loading student...</div>;
  }

  if (!student) {
    return <div className="p-6 text-center text-sm text-gray-500">Student not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-center">
            {photoUrl ? (
              <img src={photoUrl} alt={student.name} className="w-28 h-28 rounded-full object-cover border" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-2xl uppercase">
                {getInitials(student.name || '')}
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-800">{student.name || '—'}</h2>
              <p className="text-sm text-gray-500">
                ID: <span className="font-medium text-gray-600">{student.id ?? '—'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm text-gray-700 font-medium">{student.email || '—'}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">Age</div>
              <div className="text-sm text-gray-700 font-medium">{student.age ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
