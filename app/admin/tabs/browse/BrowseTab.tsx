'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
// Person type meta for display
const TYPE_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  FELLOW:  { bg: "bg-purple-100",   text: "text-purple-700",   icon: "🎓", label: "Fellow" },
  ALUMNI:   { bg: "bg-red-100",      text: "text-red-700",      icon: "⭐",  label: "Alumni" },
  STAFF:    { bg: "bg-blue-100",     text: "text-blue-700",     icon: "👔", label: "Staff" },
  LEADERSHIP: { bg: "bg-yellow-100", text: "text-yellow-800",   icon: "👑", label: "Leadership" },
  ADMIN:    { bg: "bg-green-100",    text: "text-green-700",    icon: "🛡️", label: "Admin" },
};
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type BrowseView = 'people' | 'schools' | 'placements' | 'cohorts' | 'jobs' | 'posts';

interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  type: string;
  empStatus: string;
}

interface School {
  id: string;
  name: string;
  district?: string;
}

interface Placement {
  id: string;
  name?: string;
  schoolId: string;
}

interface Cohort {
  id: string;
  name: string;
}

interface JobPosting {
  id: string;
  title: string;
  location?: string;
  jobType: string;
}

interface Post {
  id: string;
  content: string;
  postType: string;
  person: {
    firstName: string;
    lastName: string;
  };
}

export default function BrowseTab() {
  const [view, setView] = useState<BrowseView>('people');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // People filters
  const [personTypes, setPersonTypes] = useState<string[]>([]);
  const [tab, setTab] = useState('ALUMNI');
  const [cohortFilter, setCohortFilter] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [allCohorts, setAllCohorts] = useState<{id: string; name: string}[]>([]);
  // Fetch person types
  useEffect(() => {
    if (view !== 'people') return;
    fetch('/api/meta/person-types')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.types)) setPersonTypes(data.types);
      });
  }, [view]);

  // Fetch cohorts
  useEffect(() => {
    if (view !== 'people') return;
    fetch('/api/cohorts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const cohorts = data.filter((c: any) => c.id && c.name).map((c: any) => ({ id: String(c.id), name: String(c.name) }));
          setAllCohorts(cohorts);
        }
      });
  }, [view]);
  // People filter logic
  const filteredPeople = useMemo(() => {
    if (view !== 'people') return data;
    let filtered = data;
    if (tab === 'ALL') {
      // Show all
    } else if (tab === 'ALUMNI') {
      filtered = filtered.filter((person: any) => person.type === 'ALUMNI' || person.type === 'STAFF_ALUMNI');
    } else if (tab === 'STAFF') {
      filtered = filtered.filter((person: any) => person.type === 'STAFF' || person.type === 'STAFF_ALUMNI' || person.type === 'STAFF_ADMIN');
    } else {
      filtered = filtered.filter((person: any) => person.type === tab);
    }
    if (tab === 'ALUMNI') {
      if (cohortFilter) {
        filtered = filtered.filter((person: any) => person.fellowships && person.fellowships.some((f: any) => f.cohortId === cohortFilter || (f.cohort && f.cohort.id === cohortFilter)));
      }
      if (empStatusFilter) {
        filtered = filtered.filter((person: any) => person.empStatus === empStatusFilter);
      }
    }
    if (nameFilter) {
      filtered = filtered.filter((person: any) => {
        const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
        return fullName.toLowerCase().includes(nameFilter.toLowerCase());
      });
    }
    // Sort by name ascending
    filtered = [...filtered].sort((a: any, b: any) => {
      const nameA = [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ').toLowerCase();
      const nameB = [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return filtered;
  }, [data, tab, cohortFilter, empStatusFilter, nameFilter, view]);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '';
      switch (view) {
        case 'people':
          url = '/api/people';
          break;
        case 'schools':
          url = '/api/schools';
          break;
        case 'placements':
          url = '/api/placements';
          break;
        case 'cohorts':
          url = '/api/cohorts';
          break;
        case 'jobs':
          url = '/api/jobs';
          break;
        case 'posts':
          url = '/api/feed';
          break;
      }

      const response = await fetch(url);
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const viewOptions = [
    { id: 'people', label: 'People' },
    { id: 'schools', label: 'Schools' },
    { id: 'placements', label: 'Placements' },
    { id: 'cohorts', label: 'Cohorts' },
    { id: 'jobs', label: 'Job Postings' },
    { id: 'posts', label: 'Posts' },
  ];

  return (
    <div className="space-y-4">
      {/* Section nav removed for compactness */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setView(option.id as BrowseView)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === option.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* People Filters */}
      {view === 'people' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-3">
          <div className="flex-1 flex items-center sm:justify-start justify-center">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
                  <Users size={18} />
                </span>
                <select
                  className="appearance-none pl-9 pr-12 py-2 w-52 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
                  value={tab}
                  onChange={e => setTab(e.target.value)}
                >
                  <option value="ALL">All</option>
                  {personTypes.filter((t) => t !== 'ADMIN').map((t) => (
                    <option key={t} value={t}>
                      {TYPE_META[t]?.label ?? t.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap md:flex-nowrap items-center gap-3 w-full">
              {tab === 'ALUMNI' && (
                <>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="font-semibold text-purple-700">Cohort</label>
                    <select
                      className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition min-w-[140px]"
                      value={cohortFilter}
                      onChange={e => setCohortFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      {allCohorts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="font-semibold text-purple-700">Employment</label>
                    <select
                      className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                      value={empStatusFilter}
                      onChange={e => setEmpStatusFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="SEEKING">Seeking</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 w-full sm:flex-1">
                <label className="font-semibold text-purple-700">Name</label>
                <input
                  type="text"
                  className="border border-purple-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition w-full min-w-[160px]"
                  placeholder="Search by name"
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-2">
          {view === 'people' && filteredPeople.length === 0 ? (
            <Card className="p-3 text-center text-gray-500 text-sm">No data found</Card>
          ) : view === 'people' ? (
            filteredPeople.map((item: any) => (
              <Card key={item.id} className="p-3 hover:shadow-md transition text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">
                      {[item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-sm text-gray-600">{item.email1}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={TYPE_META[item.type]?.bg + ' ' + TYPE_META[item.type]?.text}>{TYPE_META[item.type]?.icon} {TYPE_META[item.type]?.label ?? item.type}</Badge>
                    <Badge className="bg-green-100 text-green-800">{item.empStatus}</Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            data.length === 0 ? (
              <Card className="p-3 text-center text-gray-500 text-sm">No data found</Card>
            ) : (
              data.map((item) => (
                <Card key={item.id} className="p-3 hover:shadow-md transition text-sm">
                  {view === 'schools' && (
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.district}</p>
                    </div>
                  )}
                  {view === 'placements' && (
                    <div>
                      <p className="font-bold">{item.name || `Placement ${item.id}`}</p>
                      <p className="text-sm text-gray-600">School: {item.schoolId}</p>
                    </div>
                  )}
                  {view === 'cohorts' && (
                    <div>
                      <p className="font-bold">{item.name}</p>
                    </div>
                  )}
                  {view === 'jobs' && (
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.location}</p>
                    </div>
                  )}
                  {view === 'posts' && (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold">
                          {item.person ? `${item.person.firstName} ${item.person.lastName}` : 'Unknown Author'}
                        </p>
                        <Badge className="bg-purple-100 text-purple-800">{item.postType}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{item.content ? item.content.substring(0, 100) : 'No content'}...</p>
                    </div>
                  )}
                </Card>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
