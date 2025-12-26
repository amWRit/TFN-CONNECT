'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type BrowseView = 'people' | 'schools' | 'placements' | 'cohorts' | 'jobs' | 'posts';

interface Person {
  id: string;
  firstName: string;
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

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-2">
          {data.length === 0 ? (
            <Card className="p-3 text-center text-gray-500 text-sm">No data found</Card>
          ) : (
            data.map((item) => (
              <Card key={item.id} className="p-3 hover:shadow-md transition text-sm">
                {view === 'people' && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{item.email1}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{item.type}</Badge>
                      <Badge className="bg-green-100 text-green-800">{item.empStatus}</Badge>
                    </div>
                  </div>
                )}
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
          )}
        </div>
      )}
    </div>
  );
}
