
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Cohort {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

export default function CohortsTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [cohortForm, setCohortForm] = useState({ name: '', startDate: '', endDate: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await fetch('/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cohortForm),
      });
      if (res.ok) {
        setCohortForm({ name: '', startDate: '', endDate: '' });
        setShowCohortForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create Cohort:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c: Cohort) => {
    setEditId(c.id);
    setEditForm({
      name: c.name,
      startDate: c.startDate || '',
      endDate: c.endDate || '',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', startDate: '', endDate: '' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      // Ensure valid ISO date or null
      const start = editForm.startDate ? new Date(editForm.startDate).toISOString() : null;
      const end = editForm.endDate ? new Date(editForm.endDate).toISOString() : null;
      const body = {
        name: editForm.name,
        description: editForm.description || null,
        start,
        end,
      };
      const res = await fetch(`/api/cohorts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '', startDate: '', endDate: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update cohort');
      }
    } catch (error) {
      console.error('Failed to update Cohort:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cohort?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cohorts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete cohort');
      }
    } catch (error) {
      alert('Failed to delete cohort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cohorts</h2>
          <Button onClick={() => setShowCohortForm(!showCohortForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showCohortForm ? 'Cancel' : '+ Add Cohort'}
          </Button>
        </div>

        {showCohortForm && (
          <Card className="p-6 mb-4">
            <form onSubmit={createCohort} className="space-y-4">
              <input
                type="text"
                placeholder="Cohort Name (e.g., Tesro Paaila)"
                value={cohortForm.name}
                onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              />
              <input
                type="date"
                placeholder="Start Date"
                value={cohortForm.startDate}
                onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              />
              <input
                type="date"
                placeholder="End Date"
                value={cohortForm.endDate}
                onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              />
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Create Cohort</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.map((c) => (
            <Card key={c.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === c.id ? (
                <form onSubmit={saveEdit} className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                    disabled={loading}
                  />
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="px-3 py-2 border rounded"
                    disabled={loading}
                  />
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="px-3 py-2 border rounded"
                    disabled={loading}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
                    <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    {c.startDate && <p className="text-sm text-gray-600">Start: {new Date(c.startDate).toLocaleDateString()}</p>}
                    {c.endDate && <p className="text-sm text-gray-600">End: {new Date(c.endDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(c)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(c.id)} aria-label="Delete">
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