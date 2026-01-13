
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface LocalGov {
  id: string;
  name: string;
  province: string;
}

export default function LocalGovTab() {
  const [localGovs, setLocalGovs] = useState<LocalGov[]>([]);
  const [showLocalGovForm, setShowLocalGovForm] = useState(false);
  const [localGovForm, setLocalGovForm] = useState({ name: '', province: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const lgRes = await fetch('/api/localgovs');
      if (lgRes.ok) setLocalGovs(await lgRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createLocalGov = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Check for duplicate name (case-insensitive)
    const duplicate = localGovs.some(lg => lg.name.trim().toLowerCase() === localGovForm.name.trim().toLowerCase());
    if (duplicate) {
      setFormError('A local government with this name already exists.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/localgovs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localGovForm),
      });
      if (res.ok) {
        setLocalGovForm({ name: '', province: '' });
        setShowLocalGovForm(false);
        fetchData();
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || 'Failed to create local government');
      }
    } catch (error) {
      setFormError('Failed to create local government');
      console.error('Failed to create LocalGov:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (lg: LocalGov) => {
    setEditId(lg.id);
    setEditForm({ name: lg.name, province: lg.province });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', province: '' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError(null);
    if (!editId) return;
    // Check for duplicate name (case-insensitive, ignore self)
    const duplicate = localGovs.some(lg => lg.id !== editId && lg.name.trim().toLowerCase() === editForm.name.trim().toLowerCase());
    if (duplicate) {
      setEditFormError('A local government with this name already exists.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/localgovs/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '', province: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        setEditFormError(errorData.error || 'Failed to update local government');
      }
    } catch (error) {
      setEditFormError('Failed to update local government');
      console.error('Failed to update LocalGov:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/localgovs/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete local government');
      }
    } catch (error) {
      alert('Failed to delete local government');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Local Governments</h2>
          <Button onClick={() => setShowLocalGovForm(!showLocalGovForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showLocalGovForm ? 'Cancel' : '+ Add Local Government'}
          </Button>
        </div>

        {showLocalGovForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={() => {
                    setShowLocalGovForm(false);
                    setLocalGovForm({ name: '', province: '' });
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Local Government</h2>
                <form onSubmit={createLocalGov} className="space-y-6">
                  {formError && (
                    <div className="mb-2 text-red-600 font-semibold text-center">{formError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="e.g., Dang"
                      value={localGovForm.name}
                      onChange={e => setLocalGovForm({ ...localGovForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Province *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="e.g., Lumbini"
                      value={localGovForm.province}
                      onChange={e => setLocalGovForm({ ...localGovForm, province: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                      disabled={loading}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={() => {
                        setShowLocalGovForm(false);
                        setLocalGovForm({ name: '', province: '' });
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localGovs.map((lg) => (
            <Card key={lg.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              <div>
                <h3 className="font-bold">{lg.name}</h3>
                <p className="text-sm text-gray-600">{lg.province}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(lg)} aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => setDeleteId(lg.id)} aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit LocalGov Modal */}
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
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Local Government</h2>
                <form onSubmit={saveEdit} className="space-y-6">
                  {editFormError && (
                    <div className="mb-2 text-red-600 font-semibold text-center">{editFormError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit name..."
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Province *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit province..."
                      value={editForm.province}
                      onChange={e => setEditForm({ ...editForm, province: e.target.value })}
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
                      Save
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
      </div>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete Local Government"
        message="Are you sure you want to delete this local government? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}