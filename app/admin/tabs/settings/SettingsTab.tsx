'use client';


import { useState } from 'react';
import { Card } from '@/components/ui/card';
import WhitelistEmailsTab from './WhitelistEmailsTab';
import FutureTab from './FutureTab';

const TABS = [
  { id: 'whitelist', label: 'Whitelisted Emails' },
  { id: 'future', label: 'Future' },
];

export default function SettingsTab() {
  const [tab, setTab] = useState('whitelist');
  return (
    <div className="w-full max-w-full px-1 sm:px-0">
      {/* Settings Tabs - styled like ToolsTab */}
      <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${tab === t.id ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
            style={{ minWidth: 0, borderRadius: 0 }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="w-full">
        {tab === 'whitelist' && (
          <WhitelistEmailsTab />
        )}
        {tab === 'future' && (
          <FutureTab />
        )}
      </div>
    </div>
  );
}
