'use client';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Cohort {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export default function CohortsTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [cohortForm, setCohortForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cRes = await fetch('/api/cohorts');
      if (cRes.ok) setCohorts(await cRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!cohortForm.name.trim()) {
      setAddError('Cohort name is required');
      return;
    }
    // Check for unique name (case-insensitive)
    if (cohorts.some(c => c.name.trim().toLowerCase() === cohortForm.name.trim().toLowerCase())) {
      setAddError('Cohort name must be unique');
      return;
    }
    if (!cohortForm.startDate) {
      setAddError('Start year is required');
      return;
    }
    if (!cohortForm.endDate) {
      setAddError('End year is required');
      return;
    }
    const startYear = parseInt(cohortForm.startDate, 10);
    const endYear = parseInt(cohortForm.endDate, 10);
    if (startYear === endYear) {
      setAddError('Start year and end year cannot be the same');
      return;
    }
    if (endYear < startYear) {
      setAddError('End year cannot be less than start year');
      return;
    }
    setLoading(true);
    try {
      // startDate is just year, so set to YYYY-01-01
      const start = `${cohortForm.startDate}-01-01`;
      // endDate is just year, so set to YYYY-12-31
      const end = `${cohortForm.endDate}-12-31`;
      const body = {
        name: cohortForm.name,
        description: cohortForm.description || null,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };
      const res = await fetch('/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setCohortForm({ name: '', description: '', startDate: '', endDate: '' });
        setShowCohortForm(false);
        fetchData();
      }
    } catch (error) {
      setAddError('Failed to create Cohort');
      console.error('Failed to create Cohort:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Cohort) => {
    setEditError('');
    setEditId(c.id);
    // Some APIs return 'start'/'end', not 'startDate'/'endDate'.
    const startRaw = (c as any).startDate || (c as any).start;
    const endRaw = (c as any).endDate || (c as any).end;
    const getYear = (dateStr?: string) => {
      if (!dateStr) {
        return '';
      }
      // Always extract first 4 digits
      const match = dateStr.match(/(\d{4})/);
      if (!match) {
        return '';
      }
      const year = parseInt(match[1], 10);
      // Only allow years in dropdown range (2013–2100)
      if (year < 2013 || year > 2100) {
        return '';
      }
      return String(year);
    };
    const startYear = getYear(startRaw);
    const endYear = getYear(endRaw);
    setEditForm({
      name: c.name,
      description: c.description || '',
      startDate: startYear,
      endDate: endYear,
    });
  };

  const cancelEdit = () => {
    setEditError('');
    setEditId(null);
    setEditForm({ name: '', description: '', startDate: '', endDate: '' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editId) return;
    if (!editForm.name.trim()) {
      setEditError('Cohort name is required');
      return;
    }
    // Check for unique name (case-insensitive, exclude current cohort)
    if (cohorts.some(c => c.id !== editId && c.name.trim().toLowerCase() === editForm.name.trim().toLowerCase())) {
      setEditError('Cohort name must be unique');
      return;
    }
    if (!editForm.startDate) {
      setEditError('Start year is required');
      return;
    }
    if (!editForm.endDate) {
      setEditError('End year is required');
      return;
    }
    const startYear = parseInt(editForm.startDate, 10);
    const endYear = parseInt(editForm.endDate, 10);
    if (startYear === endYear) {
      setEditError('Start year and end year cannot be the same');
      return;
    }
    if (endYear < startYear) {
      setEditError('End year cannot be less than start year');
      return;
    }
    setLoading(true);
    try {
      // startDate is just year, so set to YYYY-01-01
      const start = `${editForm.startDate}-01-01`;
      // endDate is just year, so set to YYYY-12-31
      const end = `${editForm.endDate}-12-31`;
      const body = {
        name: editForm.name,
        description: editForm.description || null,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };
      const res = await fetch(`/api/cohorts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '', description: '', startDate: '', endDate: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        setEditError(errorData.error || 'Failed to update cohort');
      }
    } catch (error) {
      setEditError('Failed to update Cohort');
      console.error('Failed to update Cohort:', error);
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
      const res = await fetch(`/api/cohorts/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete cohort');
      }
    } catch (error) {
      alert('Failed to delete cohort');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cohorts</h2>
          <Button onClick={() => {
            setAddError('');
            setShowCohortForm(!showCohortForm);
            if (!showCohortForm) {
              setCohortForm({ name: '', description: '', startDate: '', endDate: '' });
            }
          }} className="bg-blue-600 text-white hover:bg-blue-700">
            {showCohortForm ? 'Cancel' : '+ Add Cohort'}
          </Button>
        </div>

        {showCohortForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={() => {
                    setAddError('');
                    setShowCohortForm(false);
                    setCohortForm({ name: '', description: '', startDate: '', endDate: '' });
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Cohort</h2>
                <form onSubmit={createCohort} className="space-y-6">
                  {addError && (
                    <div className="text-red-500 text-center font-semibold mb-2">{addError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Cohort Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="e.g., First Cohort"
                      value={cohortForm.name}
                      onChange={e => setCohortForm({ ...cohortForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Description</label>
                    <textarea
                      placeholder="Description (optional)"
                      value={cohortForm.description}
                      onChange={e => setCohortForm({ ...cohortForm, description: e.target.value })}
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Start Year *</label>
                    <select
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      value={cohortForm.startDate}
                      onChange={e => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select year</option>
                      {Array.from({length: 2100-2013+1}, (_,i) => 2013+i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">End Year *</label>
                    <select
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      value={cohortForm.endDate}
                      onChange={e => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select year</option>
                      {Array.from({length: 2100-2013+1}, (_,i) => 2013+i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Cohort'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={() => {
                        setShowCohortForm(false);
                        setCohortForm({ name: '', description: '', startDate: '', endDate: '' });
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
          {cohorts.map((c) => {
            // Use same year extraction as edit modal
            const startRaw = (c as any).startDate || (c as any).start;
            const endRaw = (c as any).endDate || (c as any).end;
            const getYear = (dateStr?: string) => {
              if (!dateStr) return '';
              const match = dateStr.match(/(\d{4})/);
              if (!match) return '';
              const year = parseInt(match[1], 10);
              if (year < 2013 || year > 2100) return '';
              return String(year);
            };
            const startYear = getYear(startRaw);
            const endYear = getYear(endRaw);
            return (
              <Card key={c.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  {startYear && <p className="text-sm text-gray-600">Start Year: {startYear}</p>}
                  {endYear && <p className="text-sm text-gray-600">End Year: {endYear}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(c)} aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => setDeleteId(c.id)} aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Edit Cohort Modal */}
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
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Cohort</h2>
                <form onSubmit={saveEdit} className="space-y-6">
                  {editError && (
                    <div className="text-red-500 text-center font-semibold mb-2">{editError}</div>
                  )}
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Cohort Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit cohort name..."
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Description</label>
                    <textarea
                      placeholder="Description (optional)"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Start Year *</label>
                    <select
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      value={editForm.startDate}
                      onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select year</option>
                      {Array.from({length: 2100-2013+1}, (_,i) => 2013+i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">End Year *</label>
                    <select
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      value={editForm.endDate}
                      onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select year</option>
                      {Array.from({length: 2100-2015+1}, (_,i) => 2015+i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
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
          title="Delete Cohort"
          message="Are you sure you want to delete this cohort? This action cannot be undone."
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