import { useState } from 'react';
import { Mail } from 'lucide-react';
import AdminEmailForm from '../../../../components/AdminEmailForm';

export default function ToolsTab() {
  const [toolsTab, setToolsTab] = useState('custom-email');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${toolsTab === 'custom-email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
          onClick={() => setToolsTab('custom-email')}
        >
          <Mail className="w-4 h-4" />
          <span>Custom Email</span>
        </button>
        {/* Add more tool tabs here if needed */}
      </div>
      {toolsTab === 'custom-email' && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <AdminEmailForm />
        </div>
      )}
    </div>
  );
}
