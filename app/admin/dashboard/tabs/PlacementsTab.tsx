'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Placement {
  id: string;
  name?: string;
  schoolId: string;
  managerId: string;
  fellowCount: number;
  subjects: string[];
  school?: School;
}

interface School {
  id: string;
  name: string;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
}

export default function PlacementsTab() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [staffMembers, setStaffMembers] = useState<Person[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    schoolId: '',
    managerId: '',
    fellowCount: 0,
    subjects: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes, staffRes] = await Promise.all([
        fetch('/api/placements'),
        fetch('/api/schools'),
        fetch('/api/people?type=STAFF'),
      ]);
      if (pRes.ok) setPlacements(await pRes.json());
      if (sRes.ok) setSchools(await sRes.json());
      if (staffRes.ok) setStaffMembers(await staffRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const createPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.schoolId || !form.managerId || form.subjects.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', schoolId: '', managerId: '', fellowCount: 0, subjects: [] });
        setShowForm(false);
        fetchData();
      } else {
        alert('Failed to create placement');
      }
    } catch (error) {
      console.error('Failed to create placement:', error);
    }
  };

  const subjectOptions = ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Placements</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Placement'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={createPlacement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placement Name *</label>
              <input
                type="text"
                placeholder="e.g., Kushmawati Placement, Dang Group Placement"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">School *</label>
              <select
                value={form.schoolId}
                onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select School</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Manager (Staff) *</label>
              <select
                value={form.managerId}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Manager</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subjects Taught *</label>
              <div className="grid grid-cols-2 gap-2">
                {subjectOptions.map((subject) => (
                  <label key={subject} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4"
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of Fellows</label>
              <input
                type="number"
                min="0"
                value={form.fellowCount}
                onChange={(e) => setForm({ ...form, fellowCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <Button type="submit" className="w-full">Create Placement</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {placements.map((p) => (
          <Card key={p.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
            <div>
              <h3 className="font-bold">{p.name || `Placement ${p.id}`}</h3>
              <p className="text-sm text-gray-600">School: {p.school?.name || p.schoolId}</p>
              <p className="text-sm text-gray-600">Manager: {p.managerId}</p>
              <p className="text-sm text-gray-600">Fellows: {p.fellowCount}</p>
              <p className="text-sm text-gray-600">Subjects: {p.subjects.join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => alert('Edit Placement ' + p.id)} aria-label="Edit">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => alert('Delete Placement ' + p.id)} aria-label="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
