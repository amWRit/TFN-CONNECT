
'use client';
import { useState, useEffect, useMemo } from 'react';
import { School } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface School {
  id: string;
  name: string;
  localGovId: string;
  district: string;
  type?: string;
}
interface LocalGov {
  id: string;
  name: string;
}

export default function SchoolsTab() {
  const [schools, setSchools] = useState<School[]>([]);
  const [localGovs, setLocalGovs] = useState<LocalGov[]>([]);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

    // Filters
  const [localGovFilter, setLocalGovFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  // Filtered schools
  const filteredSchools = useMemo(() => {
    let filtered = schools;
    if (localGovFilter) {
      filtered = filtered.filter((s) => s.localGovId === localGovFilter);
    }
    if (nameFilter) {
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    return filtered;
  }, [schools, localGovFilter, nameFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, lgRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/localgovs'),
      ]);
      if (sRes.ok) setSchools(await sRes.json());
      if (lgRes.ok) setLocalGovs(await lgRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolForm),
      });
      if (res.ok) {
        setSchoolForm({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
        setShowSchoolForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create School:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: School) => {
    setEditId(s.id);
    setEditForm({
      name: s.name,
      localGovId: s.localGovId,
      district: s.district,
      type: s.type || 'SECONDARY',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update school');
      }
    } catch (error) {
      console.error('Failed to update School:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/schools/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete school');
      }
    } catch (error) {
      alert('Failed to delete school');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Schools</h2>
          <Button onClick={() => setShowSchoolForm(!showSchoolForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showSchoolForm ? 'Cancel' : '+ Add School'}
          </Button>
        </div>

        {showSchoolForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                  onClick={() => {
                    setShowSchoolForm(false);
                    setSchoolForm({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add School</h2>
                <form onSubmit={createSchool} className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">School Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="School Name"
                      value={schoolForm.name}
                      onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Local Government *</label>
                    <select
                      className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
                      value={schoolForm.localGovId}
                      onChange={e => setSchoolForm({ ...schoolForm, localGovId: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Local Government</option>
                      {localGovs.map((lg) => (
                        <option key={lg.id} value={lg.id}>{lg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">District *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="District"
                      value={schoolForm.district}
                      onChange={e => setSchoolForm({ ...schoolForm, district: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Type</label>
                    <select
                      className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
                      value={schoolForm.type}
                      onChange={e => setSchoolForm({ ...schoolForm, type: e.target.value })}
                      disabled={loading}
                    >
                      <option value="PRIMARY">Primary</option>
                      <option value="SECONDARY">Secondary</option>
                      <option value="HIGHER">Higher</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                      disabled={loading}
                    >
                      Create School
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                      onClick={() => {
                        setShowSchoolForm(false);
                        setSchoolForm({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-1.5">
          <div className="flex-1 flex items-center sm:justify-start justify-center">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
                  <School size={18} />
                </span>
                <select
                  className="appearance-none pl-9 pr-12 py-2 w-52 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
                  value={localGovFilter}
                  onChange={e => setLocalGovFilter(e.target.value)}
                >
                  <option value="">All Local Governments</option>
                  {localGovs.map((lg) => (
                    <option key={lg.id} value={lg.id}>{lg.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/80 border border-blue-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap md:flex-nowrap items-center gap-3 w-full">
              <div className="flex items-center gap-2 w-full sm:flex-1">
                <label className="font-semibold text-blue-700">Name</label>
                <input
                  type="text"
                  className="border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition w-full min-w-[160px]"
                  placeholder="Search by name"
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {filteredSchools.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-gray-600">{s.district} • {s.type || 'N/A'}</p>
                <p className="text-xs text-gray-500">LocalGov: {localGovs.find(lg => lg.id === s.localGovId)?.name || s.localGovId}</p>
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

        {/* Edit School Modal */}
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
                <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit School</h2>
                <form onSubmit={saveEdit} className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">School Name *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit school name..."
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Local Government *</label>
                    <select
                      className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
                      value={editForm.localGovId}
                      onChange={e => setEditForm({ ...editForm, localGovId: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Local Government</option>
                      {localGovs.map((lg) => (
                        <option key={lg.id} value={lg.id}>{lg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">District *</label>
                    <input
                      type="text"
                      className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                      placeholder="Edit district..."
                      value={editForm.district}
                      onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-blue-700">Type</label>
                    <select
                      className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
                      value={editForm.type}
                      onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                      disabled={loading}
                    >
                      <option value="PRIMARY">Primary</option>
                      <option value="SECONDARY">Secondary</option>
                      <option value="HIGHER">Higher</option>
                    </select>
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
        title="Delete School"
        message="Are you sure you want to delete this school? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}