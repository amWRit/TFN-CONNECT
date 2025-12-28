
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
              />
              <select
                value={groupForm.localGovId}
                onChange={(e) => setGroupForm({ ...groupForm, localGovId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Local Government</option>
                {localGovs.map((lg) => (
                  <option key={lg.id} value={lg.id}>{lg.name}</option>
                ))}
              </select>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create Group</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolGroups.map((sg) => (
            <Card key={sg.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              <div>
                <h3 className="font-bold">{sg.name}</h3>
                <p className="text-xs text-gray-500">LocalGov: {sg.localGovId}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => alert('Edit School Group ' + sg.id)} aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => alert('Delete School Group ' + sg.id)} aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}