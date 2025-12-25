'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DashboardTab from './tabs/DashboardTab';
import BrowseTab from './tabs/BrowseTab';
import ManageTab from './tabs/ManageTab';
import SettingsTab from './tabs/SettingsTab';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState('dashboard');
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
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'browse', label: 'Browse' },
    { id: 'manage', label: 'Manage' },
    { id: 'settings', label: 'Settings' },
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
        {currentTab === 'dashboard' && <DashboardTab />}
        {currentTab === 'browse' && <BrowseTab />}
        {currentTab === 'manage' && <ManageTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
