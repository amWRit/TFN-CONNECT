'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocalGov {
  id: string;
  name: string;
  province: string;
}

interface School {
  id: string;
  name: string;
  localGovId: string;
  district: string;
  type?: string;
}

interface SchoolGroup {
  id: string;
  name: string;
  localGovId: string;
}

export default function GeographyTab() {
  const [localGovs, setLocalGovs] = useState<LocalGov[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolGroups, setSchoolGroups] = useState<SchoolGroup[]>([]);

  const [showLocalGovForm, setShowLocalGovForm] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [localGovForm, setLocalGovForm] = useState({ name: '', province: '' });
  const [schoolForm, setSchoolForm] = useState({ name: '', localGovId: '', district: '', type: 'SECONDARY' });
  const [groupForm, setGroupForm] = useState({ name: '', localGovId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lgRes, sRes, sgRes] = await Promise.all([
        fetch('/api/localgovs'),
        fetch('/api/schools'),
        fetch('/api/schoolgroups'),
      ]);
      if (lgRes.ok) setLocalGovs(await lgRes.json());
      if (sRes.ok) setSchools(await sRes.json());
      if (sgRes.ok) setSchoolGroups(await sgRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createLocalGov = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Local Govs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Local Governments</h2>
          <Button onClick={() => setShowLocalGovForm(!showLocalGovForm)}>
            {showLocalGovForm ? 'Cancel' : '+ Add LocalGov'}
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
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localGovs.map((lg) => (
            <Card key={lg.id} className="p-4">
              <h3 className="font-bold">{lg.name}</h3>
              <p className="text-sm text-gray-600">{lg.province}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Schools */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Schools</h2>
          <Button onClick={() => setShowSchoolForm(!showSchoolForm)}>
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
              <Button type="submit" className="w-full">Create School</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((s) => (
            <Card key={s.id} className="p-4">
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-gray-600">{s.district} • {s.type || 'N/A'}</p>
              <p className="text-xs text-gray-500">LocalGov: {s.localGovId}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* School Groups */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">School Groups</h2>
          <Button onClick={() => setShowGroupForm(!showGroupForm)}>
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
              <Button type="submit" className="w-full">Create Group</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolGroups.map((sg) => (
            <Card key={sg.id} className="p-4">
              <h3 className="font-bold">{sg.name}</h3>
              <p className="text-xs text-gray-500">LocalGov: {sg.localGovId}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
