
import { useState } from 'react';
import { Mail, MailPlus, FileText } from 'lucide-react';
import AdminEmailForm from '../../../../components/AdminEmailForm';
import GmailDraftEmailForm from '../../../../components/GmailDraftEmailForm';

export default function ToolsTab() {
  const [mainTab, setMainTab] = useState<'email'>('email');
  const [emailTab, setEmailTab] = useState<'compose' | 'drafts'>('compose');

  return (
    <div className="w-full max-w-full px-1 sm:px-0">
      {/* Main Tabs - only Email for now, but scalable */}
      <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${mainTab === 'email' ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
          style={{ minWidth: 0, borderRadius: 0 }}
          onClick={() => setMainTab('email')}
        >
          <Mail className="w-4 h-4" />
          <span className="truncate">Email</span>
        </button>
        {/* Add more main tool tabs here if needed */}
      </div>
      {/* Email Sub-Tabs */}
      {mainTab === 'email' && (
        <>
          <div className="flex flex-wrap gap-1 mb-4 ml-0 sm:ml-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
            <button
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${emailTab === 'compose' ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
              style={{ minWidth: 0, borderRadius: 0 }}
              onClick={() => setEmailTab('compose')}
            >
              <MailPlus className="w-4 h-4" />
              <span className="truncate block sm:hidden">New</span>
              <span className="truncate hidden sm:block">Compose New Email</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${emailTab === 'drafts' ? 'border-blue-600 text-white bg-blue-500' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
              style={{ minWidth: 0, borderRadius: 0 }}
              onClick={() => setEmailTab('drafts')}
            >
              <FileText className="w-4 h-4" />
              <span className="truncate block sm:hidden">Reuse</span>
              <span className="truncate hidden sm:block">Reuse Gmail Drafts</span>
            </button>
          </div>
          {emailTab === 'compose' && (
            <div className="bg-white p-2 sm:p-6 rounded-xl border shadow-sm w-full max-w-full overflow-x-auto">
              <AdminEmailForm />
            </div>
          )}
          {emailTab === 'drafts' && (
            <div className="bg-white p-2 sm:p-6 rounded-xl border shadow-sm w-full max-w-full overflow-x-auto">
              <GmailDraftEmailForm />
            </div>
          )}
        </>
      )}
    </div>
  );
}
