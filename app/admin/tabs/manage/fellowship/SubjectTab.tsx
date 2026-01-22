'use client';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

export default function SubjectTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) setSubjects(await res.json());
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!subjectForm.name.trim()) {
      setAddError('Subject name is required');
      return;
    }
    if (subjects.some(s => s.name.trim().toLowerCase() === subjectForm.name.trim().toLowerCase())) {
      setAddError('Subject name must be unique');
      return;
    }
    setLoading(true);
    try {
      const body = { name: subjectForm.name };
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubjectForm({ name: '' });
        setShowSubjectForm(false);
        fetchData();
      }
    } catch (error) {
      setAddError('Failed to create Subject');
      console.error('Failed to create Subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: Subject) => {
    setEditError('');
    setEditId(s.id);
    setEditForm({ name: s.name });
  };

  const cancelEdit = () => {
    setEditError('');
    setEditId(null);
    setEditForm({ name: '' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editId) return;
    if (!editForm.name.trim()) {
      setEditError('Subject name is required');
      return;
    }
    if (subjects.some(s => s.id !== editId && s.name.trim().toLowerCase() === editForm.name.trim().toLowerCase())) {
      setEditError('Subject name must be unique');
      return;
    }
    setLoading(true);
    try {
      const body = { name: editForm.name };
      const res = await fetch(`/api/subjects/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        setEditError(errorData.error || 'Failed to update subject');
      }
    } catch (error) {
      setEditError('Failed to update Subject');
      console.error('Failed to update Subject:', error);
    } finally {
      setLoading(false);
    }
  };

  // ConfirmModal state for delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/subjects/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete subject');
      }
    } catch (error) {
      alert('Failed to delete subject');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Subjects</h2>
          <Button onClick={() => {
            setAddError('');
            setShowSubjectForm(!showSubjectForm);
            if (!showSubjectForm) {
              setSubjectForm({ name: '' });
            }
          }} className="bg-blue-600 text-white hover:bg-blue-700">
            {showSubjectForm ? 'Cancel' : '+ Add Subject'}
          </Button>
        </div>

        {showSubjectForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={() => {
                    setAddError('');
                    setShowSubjectForm(false);
                    setSubjectForm({ name: '' });
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Subject</h2>
                <form onSubmit={createSubject} className="space-y-6">
                  {addError && (
                    <div className="text-red-500 text-center font-semibold mb-2">{addError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Subject Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="e.g., Mathematics"
                      value={subjectForm.name}
                      onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={() => {
                        setAddError('');
                        setShowSubjectForm(false);
                        setSubjectForm({ name: '' });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              <div>
                <h3 className="font-bold">{s.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(s)} aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => setDeleteId(s.id)} aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Subject Modal */}
        {editId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={cancelEdit}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Subject</h2>
                <form onSubmit={saveEdit} className="space-y-6">
                  {editError && (
                    <div className="text-red-500 text-center font-semibold mb-2">{editError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Subject Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit subject name..."
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Confirm Delete Modal */}
        <ConfirmModal
          open={!!deleteId}
          title="Delete Subject"
          message="Are you sure you want to delete this subject? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      </div>
    </div>
  );
}
