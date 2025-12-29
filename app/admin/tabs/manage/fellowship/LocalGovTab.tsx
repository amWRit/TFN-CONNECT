
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

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
      }
    } catch (error) {
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
    if (!editId) return;
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
        alert(errorData.error || 'Failed to update local government');
      }
    } catch (error) {
      console.error('Failed to update LocalGov:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this local government?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/localgovs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete local government');
      }
    } catch (error) {
      alert('Failed to delete local government');
    } finally {
      setLoading(false);
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
          <Card className="p-6 mb-4">
            <form onSubmit={createLocalGov} className="space-y-4">
              <input
                type="text"
                placeholder="Name (e.g., Dang)"
                value={localGovForm.name}
                onChange={(e) => setLocalGovForm({ ...localGovForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Province (e.g., Lumbini)"
                value={localGovForm.province}
                onChange={(e) => setLocalGovForm({ ...localGovForm, province: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localGovs.map((lg) => (
            <Card key={lg.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === lg.id ? (
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
                    type="text"
                    value={editForm.province}
                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
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
                    <h3 className="font-bold">{lg.name}</h3>
                    <p className="text-sm text-gray-600">{lg.province}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(lg)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(lg.id)} aria-label="Delete">
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