'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email1: string;
  type: string;
  eduStatus: string;
  empStatus: string;
}

interface Cohort {
  id: string;
  name: string;
}

interface Placement {
  id: string;
  name?: string;
  schoolId: string;
  subjects: string[];
}

export default function PeopleTab() {
  const [people, setPeople] = useState<Person[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1); // 1: basic, 2: education/experience, 3: fellowship

  const [basicForm, setBasicForm] = useState({
    firstName: '',
    lastName: '',
    email1: '',
    dob: '',
    phone1: '',
    type: 'ALUMNI',
  });

  const [educations, setEducations] = useState([{ institution: '', level: '', name: '', start: '', end: '' }]);
  const [experiences, setExperiences] = useState([{ orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
  const [fellowship, setFellowship] = useState({ cohortId: '', placementId: '', subjects: [] as string[] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes, plRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/cohorts'),
        fetch('/api/placements'),
      ]);
      if (pRes.ok) setPeople(await pRes.json());
      if (cRes.ok) setCohorts(await cRes.json());
      if (plRes.ok) setPlacements(await plRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddEducation = () => {
    setEducations([...educations, { institution: '', level: '', name: '', start: '', end: '' }]);
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, { orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formStep === 1) {
      if (!basicForm.firstName || !basicForm.lastName || !basicForm.email1) {
        alert('Please fill required fields');
        return;
      }
      setFormStep(2);
      return;
    }

    if (formStep === 2) {
      if (basicForm.type === 'ALUMNI') {
        setFormStep(3);
      } else {
        submitPerson();
      }
      return;
    }

    if (formStep === 3) {
      submitPerson();
    }
  };

  const submitPerson = async () => {
    try {
      // Create person
      const personRes = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basicForm,
          dob: basicForm.dob ? new Date(basicForm.dob) : null,
        }),
      });

      if (!personRes.ok) {
        alert('Failed to create person');
        return;
      }

      const person = await personRes.json();
      const personId = person.id;

      // Create educations
      for (const edu of educations) {
        if (edu.institution) {
          await fetch('/api/educations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...edu,
              personId,
              start: new Date(edu.start),
              end: edu.end ? new Date(edu.end) : null,
            }),
          });
        }
      }

      // Create experiences
      for (const exp of experiences) {
        if (exp.orgName) {
          await fetch('/api/experiences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...exp,
              personId,
              start: new Date(exp.start),
              end: exp.end ? new Date(exp.end) : null,
            }),
          });
        }
      }

      // Create fellowship if alumni
      if (basicForm.type === 'ALUMNI' && fellowship.cohortId && fellowship.placementId) {
        await fetch('/api/fellowships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personId,
            cohortId: fellowship.cohortId,
            placementId: fellowship.placementId,
            subjects: fellowship.subjects,
          }),
        });
      }

      // Reset form
      setBasicForm({ firstName: '', lastName: '', email1: '', dob: '', phone1: '', type: 'ALUMNI' });
      setEducations([{ institution: '', level: '', name: '', start: '', end: '' }]);
      setExperiences([{ orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
      setFellowship({ cohortId: '', placementId: '', subjects: [] });
      setFormStep(1);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to submit person:', error);
      alert('Error creating person');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">People</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Person'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Basic Info */}
            {formStep === 1 && (
              <>
                <h3 className="font-bold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={basicForm.firstName}
                    onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={basicForm.lastName}
                    onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })}
                    className="px-3 py-2 border rounded"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email *"
                  value={basicForm.email1}
                  onChange={(e) => setBasicForm({ ...basicForm, email1: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={basicForm.dob}
                    onChange={(e) => setBasicForm({ ...basicForm, dob: e.target.value })}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={basicForm.phone1}
                    onChange={(e) => setBasicForm({ ...basicForm, phone1: e.target.value })}
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <select
                  value={basicForm.type}
                  onChange={(e) => setBasicForm({ ...basicForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="ALUMNI">Alumni</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </>
            )}

            {/* Step 2: Education & Experience */}
            {formStep === 2 && (
              <>
                <h3 className="font-bold">Education & Experience</h3>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Education</h4>
                  {educations.map((edu, idx) => (
                    <div key={idx} className="space-y-2 mb-4 p-3 bg-gray-50 rounded">
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].institution = e.target.value;
                          setEducations(newEdu);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Level"
                          value={edu.level}
                          onChange={(e) => {
                            const newEdu = [...educations];
                            newEdu[idx].level = e.target.value;
                            setEducations(newEdu);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Program Name"
                          value={edu.name}
                          onChange={(e) => {
                            const newEdu = [...educations];
                            newEdu[idx].name = e.target.value;
                            setEducations(newEdu);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={edu.start} onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].start = e.target.value;
                          setEducations(newEdu);
                        }} className="px-2 py-1 border rounded text-sm" />
                        <input type="date" value={edu.end} onChange={(e) => {
                          const newEdu = [...educations];
                          newEdu[idx].end = e.target.value;
                          setEducations(newEdu);
                        }} className="px-2 py-1 border rounded text-sm" />
                      </div>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddEducation} variant="outline" className="text-sm">
                    + Add Education
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Experience</h4>
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="space-y-2 mb-4 p-3 bg-gray-50 rounded">
                      <input
                        type="text"
                        placeholder="Organization"
                        value={exp.orgName}
                        onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].orgName = e.target.value;
                          setExperiences(newExp);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[idx].title = e.target.value;
                            setExperiences(newExp);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Sector"
                          value={exp.sector}
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[idx].sector = e.target.value;
                            setExperiences(newExp);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={exp.start} onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].start = e.target.value;
                          setExperiences(newExp);
                        }} className="px-2 py-1 border rounded text-sm" />
                        <input type="date" value={exp.end} onChange={(e) => {
                          const newExp = [...experiences];
                          newExp[idx].end = e.target.value;
                          setExperiences(newExp);
                        }} className="px-2 py-1 border rounded text-sm" />
                      </div>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddExperience} variant="outline" className="text-sm">
                    + Add Experience
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Fellowship (Alumni only) */}
            {formStep === 3 && basicForm.type === 'ALUMNI' && (
              <>
                <h3 className="font-bold">Fellowship Information</h3>
                <select
                  value={fellowship.cohortId}
                  onChange={(e) => setFellowship({ ...fellowship, cohortId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Cohort</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={fellowship.placementId}
                  onChange={(e) => setFellowship({ ...fellowship, placementId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Placement</option>
                  {placements.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || `Placement ${p.id}`}</option>
                  ))}
                </select>
              </>
            )}

            <div className="flex gap-2">
              {formStep > 1 && (
                <Button type="button" onClick={() => setFormStep(formStep - 1)} variant="outline">
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {formStep < 3 ? 'Next' : 'Create Person'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {people.slice(0, 10).map((p) => (
          <Card key={p.id} className="p-4">
            <h3 className="font-bold">{p.firstName} {p.lastName}</h3>
            <p className="text-sm text-gray-600">{p.email1}</p>
            <p className="text-xs text-gray-500">{p.type}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
