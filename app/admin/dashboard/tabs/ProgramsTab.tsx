'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';




interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function ProgramsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'teaching' });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await fetch('/api/skills');
      if (sRes.ok) setSkills(await sRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
