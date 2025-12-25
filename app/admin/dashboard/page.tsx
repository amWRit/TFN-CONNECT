'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GeographyTab from './tabs/GeographyTab';
import ProgramsTab from './tabs/ProgramsTab';
import PlacementsTab from './tabs/PlacementsTab';
import PeopleTab from './tabs/PeopleTab';

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState('geography');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const auto = searchParams.get('auto');
    const auth = localStorage.getItem('adminAuth');
    
    if (auto === 'true' && !auth) {
      // Auto-login with default credentials
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', 'adminconnect@teachfornepal.org');
      setIsAuthed(true);
    } else if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthed(true);
    }
  }, [searchParams, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  if (!isAuthed) return null;

  const tabs = [
    { id: 'geography', label: 'Geography' },
    { id: 'programs', label: 'Programs' },
    { id: 'placements', label: 'Placements' },
    { id: 'people', label: 'People' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TFN Connect Admin</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentTab === 'geography' && <GeographyTab />}
        {currentTab === 'programs' && <ProgramsTab />}
        {currentTab === 'placements' && <PlacementsTab />}
        {currentTab === 'people' && <PeopleTab />}
      </div>
    </div>
  );
}
