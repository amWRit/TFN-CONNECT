'use client';

import { Card } from '@/components/ui/card';
import WhitelistEmailsTab from './WhitelistEmailsTab';

export default function SettingsTab() {
  return (
    <div className="space-y-4">
      {/* Whitelist Emails Management */}
      <div>
        <WhitelistEmailsTab />
      </div>
      {/* ...existing code... */}
      <Card className="p-3 bg-blue-50 border border-blue-200 text-sm">
        <h3 className="font-bold text-blue-900 mb-2">Coming Soon</h3>
        <p className="text-blue-700">
          Admin settings and configuration options will be available here. Features include:
        </p>
        <ul className="text-blue-700 text-sm mt-4 space-y-2 ml-4">
          <li>• Email notifications preferences</li>
          <li>• User roles and permissions</li>
          <li>• System configuration</li>
          <li>• Backup and restore options</li>
        </ul>
      </Card>
    </div>
  );
}
