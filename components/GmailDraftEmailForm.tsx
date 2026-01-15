import { useState, useEffect } from 'react';
import { PersonType } from '@prisma/client';
import { Mail, Send, Users, AtSign, ChevronDown, Hash, Loader2 } from 'lucide-react';

export default function GmailDraftEmailForm() {
  // Form state
  const [subject, setSubject] = useState('');
  const [ccList, setCcList] = useState('');
  const [bccList, setBccList] = useState('');
  const [personType, setPersonType] = useState<PersonType | ''>('ADMIN');
  const [emailPreference, setEmailPreference] = useState<'primary' | 'secondary' | 'both'>('primary');
  // Removed body and previewHtml state
  const [recipientCount, setRecipientCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Gmail Drafts
  const [drafts, setDrafts] = useState<{id: string, subject: string}[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState('');

  // Fetch Gmail drafts (subject only)
  useEffect(() => {
    async function fetchDrafts() {
      try {
        const res = await fetch('/api/gmail/drafts');
        const data = await res.json();
        setDrafts(data.drafts || []);
      } catch {
        setDrafts([]);
      }
    }
    fetchDrafts();
  }, []);

  // When a draft is selected, fetch its subject only (no body)
  useEffect(() => {
    async function fetchDraftSubject() {
      if (!selectedDraftId) return;
      try {
        const res = await fetch(`/api/gmail/draft?id=${selectedDraftId}`);
        const data = await res.json();
        setSubject(data.subject || '');
      } catch {}
    }
    fetchDraftSubject();
  }, [selectedDraftId]);

  // Fetch live recipient count
  useEffect(() => {
    async function fetchCount() {
      try {
        const params = new URLSearchParams({
          personType: personType || '',
          emailPreference
        });
        const res = await fetch(`/api/admin/email/recipients?${params}`);
        const data = await res.json();
        setRecipientCount(data.count || 0);
      } catch {
        setRecipientCount(0);
      }
    }
    fetchCount();
  }, [personType, emailPreference]);

  // Removed live preview logic

  // Send test email via Gmail API (send draft to self)
  const handleSendTest = async () => {
    if (!selectedDraftId) return alert('Select a draft first');
    setSending(true);
    try {
      const res = await fetch('/api/gmail/send-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: selectedDraftId }),
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        alert('Draft sent to your Gmail outbox');
      } else {
        alert('Failed to send draft');
      }
    } catch {
      alert('Failed to send draft');
    }
    setSending(false);
  };

  // Send draft content to all recipients via new API
  const handleSendAll = async () => {
    if (!selectedDraftId) return alert('Select a draft first');
    setShowConfirm(false);
    setSending(true);
    try {
      // Fetch recipients from API
      const params = new URLSearchParams({
        personType: personType || '',
        emailPreference
      });
      const resRecipients = await fetch(`/api/admin/email/recipients?${params}`);
      const dataRecipients = await resRecipients.json();
      const recipients = (dataRecipients.users || []).map((u: any) => {
        let email = '';
        if (emailPreference === 'primary') email = u.email1;
        else if (emailPreference === 'secondary') email = u.email2;
        else if (emailPreference === 'both') email = u.email1 || u.email2;
        return { email, name: u.firstName };
      }).filter((r: any) => r.email && typeof r.email === 'string' && r.email.includes('@'));
      if (recipients.length === 0) {
        alert('No recipients found.');
        setSending(false);
        return;
      }
      // Send draft content to all recipients
      const res = await fetch('/api/gmail/send-draft-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: selectedDraftId, recipients, cc: ccList, bcc: bccList }),
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        alert(`Draft sent to ${recipients.length} users!`);
      } else {
        alert('Failed to send draft to all recipients');
      }
    } catch {
      alert('Failed to send draft');
    }
    setSending(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-xl border-2 border-blue-200 animate-fade-in">
      <form className="space-y-8">
        {/* Gmail Draft Selection */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><Mail className="w-5 h-5" /> Select Gmail Draft</label>
          <select
            value={selectedDraftId}
            onChange={e => setSelectedDraftId(e.target.value)}
            className="w-full border-2 border-blue-200 focus:border-pink-400 rounded-lg px-4 py-2 mt-1 appearance-none text-base bg-white/80 focus:shadow-lg transition-all"
          >
            <option value="">-- Choose a draft --</option>
            {drafts.map(d => (
              <option key={d.id} value={d.id}>{d.subject}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">Selecting a draft will load its subject and body below.</div>
        </div>
        {/* Subject */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><Mail className="w-5 h-5" /> Subject</label>
          <div className="relative">
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={120}
              className="w-full border-2 border-blue-200 focus:border-pink-400 rounded-lg px-4 py-2 mt-1 text-lg transition-all focus:shadow-lg bg-white/80"
              placeholder="What's this email about?"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white/80 px-2 rounded-full">{subject.length}/120</span>
          </div>
        </div>
        {/* CC List */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><AtSign className="w-5 h-5" /> CC List</label>
          <input
            type="text"
            value={ccList}
            onChange={e => setCcList(e.target.value)}
            placeholder="Comma-separated emails (optional)"
            className="w-full border-2 border-blue-200 focus:border-pink-400 rounded-lg px-4 py-2 mt-1 transition-all focus:shadow-lg bg-white/80"
          />
        </div>
        {/* BCC List */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><AtSign className="w-5 h-5" /> BCC List</label>
          <input
            type="text"
            value={bccList}
            onChange={e => setBccList(e.target.value)}
            placeholder="Comma-separated emails (optional)"
            className="w-full border-2 border-blue-200 focus:border-pink-400 rounded-lg px-4 py-2 mt-1 transition-all focus:shadow-lg bg-white/80"
          />
        </div>
        {/* Person Type (Recipient) */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><Users className="w-5 h-5" /> Recipient Type</label>
          <div className="relative">
            <select
              value={personType}
              onChange={e => setPersonType(e.target.value as PersonType)}
              className="w-full border-2 border-blue-200 focus:border-pink-400 rounded-lg px-4 py-2 mt-1 appearance-none text-base bg-white/80 focus:shadow-lg transition-all"
            >
              <option value="">All</option>
              <option value="FELLOW">Fellow</option>
              <option value="ALUMNI">Alumni</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF_ADMIN">Staff Admin</option>
              <option value="STAFF_ALUMNI">Staff Alumni</option>
              <option value="LEADERSHIP">Leadership</option>
              <option value="GENERAL">General</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
          </div>
          <div className="text-xs text-pink-600 mt-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Will send to <span className="font-bold">{recipientCount}</span> users</div>
        </div>
        {/* Email Preference */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><AtSign className="w-5 h-5" /> Email Preference</label>
          <div className="flex gap-4 mt-1">
            <label className={emailPreference==='primary' ? 'bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 font-semibold text-blue-700' : 'px-3 py-1 rounded-full flex items-center gap-1 text-gray-600 cursor-pointer hover:bg-blue-50'}>
              <input type="radio" checked={emailPreference==='primary'} onChange={()=>setEmailPreference('primary')} className="accent-blue-600" /> Primary
            </label>
            <label className={emailPreference==='secondary' ? 'bg-pink-100 px-3 py-1 rounded-full flex items-center gap-1 font-semibold text-pink-700' : 'px-3 py-1 rounded-full flex items-center gap-1 text-gray-600 cursor-pointer hover:bg-pink-50'}>
              <input type="radio" checked={emailPreference==='secondary'} onChange={()=>setEmailPreference('secondary')} className="accent-pink-600" /> Secondary
            </label>
            <label className={emailPreference==='both' ? 'bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1 font-semibold text-yellow-700' : 'px-3 py-1 rounded-full flex items-center gap-1 text-gray-600 cursor-pointer hover:bg-yellow-50'}>
              <input type="radio" checked={emailPreference==='both'} onChange={()=>setEmailPreference('both')} className="accent-yellow-500" /> Both
            </label>
          </div>
        </div>
        {/* Removed body editor and live preview UI */}
        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          {!sending && (
            <>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg transition-all text-lg disabled:opacity-60"
                onClick={handleSendTest}
                disabled={sending || !selectedDraftId}
                title="Send this draft to yourself"
              >
                <Send className="w-5 h-5" /> Send Test
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg transition-all text-lg disabled:opacity-60"
                onClick={()=>setShowConfirm(true)}
                disabled={sending || !selectedDraftId}
                title="Send this draft to all selected users"
              >
                <Send className="w-5 h-5" /> Send to All
              </button>
            </>
          )}
        </div>
      </form>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full border-2 border-pink-200 flex flex-col items-center">
            <Send className="w-10 h-10 text-pink-500 mb-2 animate-bounce" />
            <h2 className="text-xl font-bold mb-2 text-blue-700">Send to {recipientCount} users?</h2>
            <p className="mb-4 text-gray-600 text-center">This can't be undone. Are you sure you want to send this email to <span className="font-bold text-pink-600">{recipientCount}</span> users?</p>
            <div className="flex gap-4 mt-2">
              <button className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200 transition-all" onClick={()=>setShowConfirm(false)}>Cancel</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow transition-all" onClick={handleSendAll}>Send</button>
            </div>
          </div>
        </div>
      )}
      {/* Progress Bar */}
      {sending && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50"><Loader2 className="w-5 h-5 animate-spin" /> Sending...</div>}
    </div>
  );
}
