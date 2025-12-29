
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface SchoolGroup {
  id: string;
  name: string;
  localGovId: string;
}
interface LocalGov {
  id: string;
  name: string;
}

export default function SchoolGroupsTab() {
  const [schoolGroups, setSchoolGroups] = useState<SchoolGroup[]>([]);
  const [localGovs, setLocalGovs] = useState<LocalGov[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', localGovId: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', localGovId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sgRes, lgRes] = await Promise.all([
        fetch('/api/schoolgroups'),
        fetch('/api/localgovs'),
      ]);
      if (sgRes.ok) setSchoolGroups(await sgRes.json());
      if (lgRes.ok) setLocalGovs(await lgRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createSchoolGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/schoolgroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm),
      });
      if (res.ok) {
        setGroupForm({ name: '', localGovId: '' });
        setShowGroupForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create SchoolGroup:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (sg: SchoolGroup) => {
    setEditId(sg.id);
    setEditForm({ name: sg.name, localGovId: sg.localGovId });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', localGovId: '' });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schoolgroups/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditId(null);
        setEditForm({ name: '', localGovId: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update school group');
      }
    } catch (error) {
      console.error('Failed to update SchoolGroup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this school group?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/schoolgroups/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete school group');
      }
    } catch (error) {
      alert('Failed to delete school group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">School Groups</h2>
          <Button onClick={() => setShowGroupForm(!showGroupForm)} className="bg-blue-600 text-white hover:bg-blue-700">
            {showGroupForm ? 'Cancel' : '+ Add Group'}
          </Button>
        </div>

        {showGroupForm && (
          <Card className="p-6 mb-4">
            <form onSubmit={createSchoolGroup} className="space-y-4">
              <input
                type="text"
                placeholder="Group Name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              />
              <select
                value={groupForm.localGovId}
                onChange={(e) => setGroupForm({ ...groupForm, localGovId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
                disabled={loading}
              >
                <option value="">Select Local Government</option>
                {localGovs.map((lg) => (
                  <option key={lg.id} value={lg.id}>{lg.name}</option>
                ))}
              </select>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Create Group</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolGroups.map((sg) => (
            <Card key={sg.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              {editId === sg.id ? (
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
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
                    <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold">{sg.name}</h3>
                    <p className="text-xs text-gray-500">LocalGov: {localGovs.find(lg => lg.id === sg.localGovId)?.name || sg.localGovId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(sg)} aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(sg.id)} aria-label="Delete">
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