'use client';

import { Suspense } from 'react';
import { LogOut } from 'lucide-react';
import {
  LayoutDashboard,
  Search,
  Settings2,
  Users,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DashboardTab from '../tabs/dashboard/IndexTab';
import BrowseTab from '../tabs/browse/BrowseTab';
import ManageTab from '../tabs/manage/ManageTab';
import SettingsTab from '../tabs/settings/SettingsTab';

function AdminDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    // { id: 'browse', label: 'Browse', icon: <Search size={20} /> },
    { id: 'manage', label: 'Manage', icon: <Settings2 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`min-h-screen sticky top-0 z-30 flex flex-col transition-all duration-200 ${
          sidebarOpen ? 'w-40' : 'w-12'
        } bg-white/90 border-r shadow-lg rounded-r-3xl`}
      >
        <div>
          <div className={`flex items-center justify-between px-4 py-6 ${sidebarOpen ? '' : 'justify-center'}`}>
            {sidebarOpen && (
              <div className="font-bold text-lg text-blue-700 tracking-tight">Admin</div>
            )}
            <button
              className="rounded-full p-1.5 hover:bg-blue-100 transition"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-3 text-left px-3 py-2 font-medium transition-colors text-sm w-full ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                }`}
                title={tab.label}
              >
                <span>{tab.icon}</span>
                {sidebarOpen && <span>{tab.label}</span>}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 text-left px-3 py-2 font-semibold transition-colors text-sm w-full mt-4
                bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-900
                ${sidebarOpen ? '' : 'justify-center px-2'}`}
              title="Logout"
            >
              <LogOut size={18} className="inline-block" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'dashboard' && <DashboardTab />}
        {/* {currentTab === 'browse' && <BrowseTab />} */}
        {currentTab === 'manage' && <ManageTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>
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
