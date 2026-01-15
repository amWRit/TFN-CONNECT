
import { useState } from 'react';
import { Mail, FileText } from 'lucide-react';
import AdminEmailForm from '../../../../components/AdminEmailForm';

export default function ToolsTab() {
  const [mainTab, setMainTab] = useState<'email'>('email');
  const [emailTab, setEmailTab] = useState<'compose' | 'drafts'>('compose');

  return (
    <div>
      {/* Main Tabs - only Email for now, but scalable */}
      <div className="flex gap-2 mb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${mainTab === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
          onClick={() => setMainTab('email')}
        >
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </button>
        {/* Add more main tool tabs here if needed */}
      </div>
      {/* Email Sub-Tabs */}
      {mainTab === 'email' && (
        <>
          <div className="flex gap-2 mb-4 ml-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${emailTab === 'compose' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
              onClick={() => setEmailTab('compose')}
            >
              <Mail className="w-4 h-4" />
              <span>Compose Email</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${emailTab === 'drafts' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
              onClick={() => setEmailTab('drafts')}
            >
              <FileText className="w-4 h-4" />
              <span>Gmail Drafts</span>
            </button>
          </div>
          {emailTab === 'compose' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <AdminEmailForm />
            </div>
          )}
          {emailTab === 'drafts' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              {/* TODO: Implement Gmail Drafts integration here */}
              <div className="text-gray-500 text-center py-12">Gmail Drafts integration coming soon.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
