
'use client';
import { useState, useEffect } from 'react';
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
              />
              <select
                value={schoolForm.localGovId}
                onChange={(e) => setSchoolForm({ ...schoolForm, localGovId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
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
              />
              <select
                value={schoolForm.type}
                onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
                <option value="HIGHER">Higher</option>
              </select>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create School</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-gray-600">{s.district} • {s.type || 'N/A'}</p>
                <p className="text-xs text-gray-500">LocalGov: {s.localGovId}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => alert('Edit School ' + s.id)} aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => alert('Delete School ' + s.id)} aria-label="Delete">
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