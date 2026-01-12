
'use client';
import { useState, useEffect, useMemo } from 'react';
import { School } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete school');
      }
    } catch (error) {
      alert('Failed to delete school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Schools</h2>
          <Button onClick={() => setShowSchoolForm(!showSchoolForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showSchoolForm ? 'Cancel' : '+ Add School'}
          </Button>
        </div>

        {showSchoolForm && (
          <Card className="p-6 mb-4">
            <form onSubmit={createSchool} className="space-y-4">
              <input
                type="text"
                placeholder="School Name"
                value={schoolForm.name}
                onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              />
              <select
                value={schoolForm.localGovId}
                onChange={(e) => setSchoolForm({ ...schoolForm, localGovId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              >
                <option value="">Select Local Government</option>
                {localGovs.map((lg) => (
                  <option key={lg.id} value={lg.id}>{lg.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="District"
                value={schoolForm.district}
                onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              />
              <select
                value={schoolForm.type}
                onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              >
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
                <option value="HIGHER">Higher</option>
              </select>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Create School</Button>
            </form>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchools.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === s.id ? (
                <form onSubmit={saveEdit} className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                    disabled={loading}
                  />
                  <select
                    value={editForm.localGovId}
                    onChange={(e) => setEditForm({ ...editForm, localGovId: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Local Government</option>
                    {localGovs.map((lg) => (
                      <option key={lg.id} value={lg.id}>{lg.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                    disabled={loading}
                  />
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="px-3 py-2 border rounded"
                    disabled={loading}
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="HIGHER">Higher</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
                    <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold">{s.name}</h3>
                    <p className="text-sm text-gray-600">{s.district} • {s.type || 'N/A'}</p>
                    <p className="text-xs text-gray-500">LocalGov: {localGovs.find(lg => lg.id === s.localGovId)?.name || s.localGovId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(s)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(s.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}