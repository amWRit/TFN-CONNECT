'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Cohort {
  id: string;
  name: string;
  description?: string;
  start?: string;
  end?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function ProgramsTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [showCohortForm, setShowCohortForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);

  const [cohortForm, setCohortForm] = useState({ name: '', description: '', start: '', end: '' });
  const [skillForm, setSkillForm] = useState({ name: '', category: 'teaching' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/cohorts'),
        fetch('/api/skills'),
      ]);
      if (cRes.ok) setCohorts(await cRes.json());
      if (sRes.ok) setSkills(await sRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const createCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cohortForm,
          start: cohortForm.start ? new Date(cohortForm.start) : null,
          end: cohortForm.end ? new Date(cohortForm.end) : null,
        }),
      });
      if (res.ok) {
        setCohortForm({ name: '', description: '', start: '', end: '' });
        setShowCohortForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create Cohort:', error);
    }
  };

  const createSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm),
      });
      if (res.ok) {
        setSkillForm({ name: '', category: 'teaching' });
        setShowSkillForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create Skill:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cohorts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cohorts</h2>
          <Button onClick={() => setShowCohortForm(!showCohortForm)}>
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
              />
              <textarea
                placeholder="Description"
                value={cohortForm.description}
                onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={cohortForm.start}
                  onChange={(e) => setCohortForm({ ...cohortForm, start: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="date"
                  value={cohortForm.end}
                  onChange={(e) => setCohortForm({ ...cohortForm, end: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
              </div>
              <Button type="submit" className="w-full">Create Cohort</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.map((c) => (
            <Card key={c.id} className="p-4">
              <h3 className="font-bold">{c.name}</h3>
              {c.description && <p className="text-sm text-gray-600">{c.description}</p>}
              {c.start && <p className="text-xs text-gray-500">{c.start} to {c.end || 'Ongoing'}</p>}
            </Card>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Skills</h2>
          <Button onClick={() => setShowSkillForm(!showSkillForm)}>
            {showSkillForm ? 'Cancel' : '+ Add Skill'}
          </Button>
        </div>

        {showSkillForm && (
          <Card className="p-6 mb-4">
            <form onSubmit={createSkill} className="space-y-4">
              <input
                type="text"
                placeholder="Skill Name"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <select
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="teaching">Teaching</option>
                <option value="leadership">Leadership</option>
                <option value="personal">Personal</option>
                <option value="interpersonal">Interpersonal</option>
                <option value="technical">Technical</option>
              </select>
              <Button type="submit" className="w-full">Create Skill</Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skills.map((s) => (
            <Card key={s.id} className="p-4">
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{s.category}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
