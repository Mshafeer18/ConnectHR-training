// src/components/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { postForm } from '../api';
import { useHeaderActions } from './HeaderContext';

const StudentForm = ({ student: propStudent = null, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { setRightNode } = useHeaderActions();

  const [student, setStudent] = useState(propStudent);
  const [form, setForm] = useState({
    name: propStudent?.name || '',
    email: propStudent?.email || '',
    age: propStudent?.age || '',
    photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // helper to turn relative backend paths into absolute URLs
  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    if (url.startsWith('/')) return `${base}${url}`;
    return `${base}/${url}`;
  };

  // Resolve existing photo from common fields
  const existingPhotoUrlRaw =
    student?.photoUrl ||
    student?.photo_url ||
    (student?.photo && (typeof student.photo === 'string' ? student.photo : null)) ||
    (student?.media && student.media[0] && (student.media[0].thumb_url || student.media[0].url)) ||
    null;

  const existingPhotoUrlResolved = existingPhotoUrlRaw ? resolveUrl(existingPhotoUrlRaw) : null;

  // Fetch student when routeId present and no propStudent provided
  useEffect(() => {
    let mounted = true;
    if (!propStudent && routeId) {
      setLoading(true);
      api
        .get(`/students/${routeId}`)
        .then((res) => {
          if (!mounted) return;
          const studentData = res.data?.data || null; // <-- fix here
          setStudent(studentData);
        setForm({
          name: studentData?.name || '',
          email: studentData?.email || '',
          age: studentData?.age ?? '',
          photo: null,
        });
        })
        .catch((err) => {
          console.error(err);
          // if not found or error, navigate back to list
          navigate('/students', { replace: true });
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else if (propStudent) {
      // ensure local student state follows prop changes
      setStudent(propStudent);
      setForm({
        name: propStudent?.name || '',
        email: propStudent?.email || '',
        age: propStudent?.age ?? '',
        photo: null,
      });
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propStudent, routeId]);

  // set Back button in header while form is active
  useEffect(() => {
    const node = (
      <button
        onClick={() => {
          if (typeof onClose === 'function') onClose();
          else navigate(-1);
        }}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white text-sm hover:bg-slate-50"
      >
        ← Back
      </button>
    );

    setRightNode(node);
    return () => setRightNode(null);
  }, [setRightNode, onClose, navigate]);

  // cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (e) {}
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name } = e.target;

    if (name === 'photo') {
      const file = e.target.files[0] || null;
      setForm((p) => ({ ...p, photo: file }));

      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (_) {}
        setPreview(null);
      }

      if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        setRemovePhoto(false);
      }
    } else {
      setForm((p) => ({ ...p, [name]: e.target.value }));
    }
  };

  const handleRemovePhotoToggle = (e) => {
    const checked = e.target.checked;
    setRemovePhoto(checked);
    if (checked) {
      if (form.photo) setForm((p) => ({ ...p, photo: null }));
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (_) {}
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    if (form.age !== '') formData.append('age', form.age);
    if (form.photo) formData.append('photo', form.photo);
    if (removePhoto) formData.append('remove_photo', '1');

    setSubmitting(true);
    try {
      if (student?.id || routeId) {
        const targetId = student?.id || routeId;
        await postForm(`/students/${targetId}?_method=PUT`, formData);
        // After edit, navigate to the student's detail page (route-based)
        if (typeof onClose === 'function') onClose();
        else navigate(`/students/${targetId}`, { replace: true });
      } else {
        const res = await postForm('/students', formData);
        // After create, navigate to the new student's detail page if API returned id
        const newId = res?.data?.id;
        if (typeof onClose === 'function') onClose();
        else if (newId) navigate(`/students/${newId}`, { replace: true });
        else navigate('/students', { replace: true });
      }

      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (_) {}
        setPreview(null);
      }
    } catch (err) {
      console.error(err);
      // sync import style:
      // import { parseError } from '../lib/apiError';
      const { parseError } = await import('../lib/apiError');
      const e = parseError(err);

      if (e.errors && typeof e.errors === 'object') {
        // flatten field-level messages into array
        const flat = Object.values(e.errors).flat();
        setErrors(flat);
      } else {
        setErrors([e.message || 'An unexpected error occurred.']);
      }
    } finally {
      setSubmitting(false);
    }

  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-500">Loading student...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{student?.id || routeId ? 'Edit Student' : 'Create Student'}</h2>
          <p className="text-sm text-gray-500">Fill the details and upload a photo (optional)</p>
        </div>
        <div className="text-sm text-gray-400">ID: {student?.id ?? routeId ?? '—'}</div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-100 text-red-700">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            className="mt-1 block w-32 rounded-md border border-gray-200 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>

          <div className="mt-2 flex items-center gap-4">
            {/* existing photo when editing and not removed and no new preview */}
            {(student?.id || routeId) && existingPhotoUrlResolved && !preview && !removePhoto && (
              <img src={existingPhotoUrlResolved} alt="current" className="w-20 h-20 rounded-md object-cover border" />
            )}

            {/* preview for newly selected file */}
            {preview && <img src={preview} alt="preview" className="w-20 h-20 rounded-md object-cover border" />}

            {/* fallback avatar when nothing */}
            {!preview && (!existingPhotoUrlResolved || removePhoto) && (
              <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">No photo</div>
            )}

            <div className="flex-1">
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100"
              />

              {(student?.id || routeId) && existingPhotoUrlResolved && (
                <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={handleRemovePhotoToggle}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remove current photo</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              'Save'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof onClose === 'function') onClose();
              else navigate(-1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
