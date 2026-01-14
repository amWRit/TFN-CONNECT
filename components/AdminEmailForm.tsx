import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PersonType } from '@prisma/client';
import { Mail, Image as ImageIcon, Eye, Send, Users, AtSign, ChevronDown, ChevronUp, Smile, FileText, Hash, Loader2 } from 'lucide-react';

const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function AdminEmailForm() {
  // Form state
  const [subject, setSubject] = useState('');
  const [ccList, setCcList] = useState('');
  // Removed recipientType, only use personType
  const [personType, setPersonType] = useState<PersonType | ''>('');
  const [emailPreference, setEmailPreference] = useState<'primary' | 'secondary' | 'both'>('primary');
  const [bodyTab, setBodyTab] = useState<'markdown' | 'html'>('markdown');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = {
      subject, ccList, personType, emailPreference, bodyTab, body, images
    };
    localStorage.setItem('adminEmailDraft', JSON.stringify(draft));
  }, [subject, ccList, personType, emailPreference, bodyTab, body, images]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('adminEmailDraft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setSubject(d.subject || '');
        setCcList(d.ccList || '');
        setPersonType(d.personType || '');
        setEmailPreference(d.emailPreference || 'primary');
        setBodyTab(d.bodyTab || 'visual');
        setBody(d.body || '');
        setImages(d.images || []);
      } catch {}
    }
  }, []);

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

  // Live preview
  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch('/api/admin/email/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, body, images, bodyTab })
        });
        const data = await res.json();
        setPreviewHtml(data.html || '');
      } catch {
        setPreviewHtml('<div>Preview error</div>');
      }
    }
    fetchPreview();
  }, [subject, body, images, bodyTab]);

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      try {
        const res = await fetch('/api/admin/email/temp-upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      } catch {}
    }
    setImages([...images, ...uploaded]);
  };

  // Send test email
  const handleSendTest = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body: previewHtml,
          recipients: [{ email: 'tfnconnect@gmail.com', name: 'Admin' }],
          cc: ccList,
          images
        })
      });
      await res.json();
      alert('Test email sent to tfnconnect@gmail.com');
    } catch {
      alert('Failed to send test email');
    }
    setSending(false);
  };

  // Send to all
  const handleSendAll = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      // Fetch all recipients
      const params = new URLSearchParams({
        personType: personType || '',
        emailPreference
      });
      const resRecipients = await fetch(`/api/admin/email/recipients?${params}`);
      const dataRecipients = await resRecipients.json();
      const recipients = (dataRecipients.users || []).map((u: any) => ({
        email: emailPreference === 'primary' ? u.email1 : emailPreference === 'secondary' ? u.email2 : (u.email1 || u.email2),
        name: u.firstName
      })).filter((r: any) => r.email);
      // Send email
      const res = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body: previewHtml,
          recipients,
          cc: ccList,
          images
        })
      });
      await res.json();
      alert(`Email sent to ${recipients.length} users.`);
    } catch {
      alert('Failed to send email');
    }
    setSending(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-xl border-2 border-blue-200 animate-fade-in">
      <form className="space-y-8">
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
          <label className="font-medium flex items-center gap-2 text-blue-700"><FileText className="w-5 h-5" /> Email Preference</label>
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
        {/* Body Editor Tabs */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><Smile className="w-5 h-5" /> Email Body</label>
          <div className="flex gap-2 mb-2">
            <button type="button" className={bodyTab==='markdown' ?"bg-pink-600 text-white px-3 py-1 rounded-full shadow" :"bg-gray-100 px-3 py-1 rounded-full hover:bg-pink-100"} onClick={()=>setBodyTab('markdown')}><FileText className="w-4 h-4 inline mr-1" /> Markdown</button>
            <button type="button" className={bodyTab==='html' ?"bg-yellow-500 text-white px-3 py-1 rounded-full shadow" :"bg-gray-100 px-3 py-1 rounded-full hover:bg-yellow-100"} onClick={()=>setBodyTab('html')}><Hash className="w-4 h-4 inline mr-1" /> HTML</button>
          </div>
          <div className="border-2 border-blue-100 rounded-xl p-2 bg-white/70 shadow-inner">
            {bodyTab==='markdown' && <MarkdownEditor value={body} onChange={v => setBody(v ?? '')} />}
            {bodyTab==='html' && <textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full min-h-[200px] border rounded-xl p-2 bg-white/90" placeholder="Paste or write HTML here..." />}
          </div>
        </div>
        {/* Image Attachments */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><ImageIcon className="w-5 h-5" /> Image Attachments</label>
          <div className="border-dashed border-2 border-pink-300 rounded-xl p-4 flex flex-col items-center gap-2 bg-pink-50/40">
            <ImageIcon className="w-10 h-10 text-pink-400 animate-pulse" />
            <input type="file" accept="image/*" multiple onChange={e => handleImageUpload(e.target.files!)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200" />
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => <img key={i} src={img} alt="attachment" className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200 shadow" />)}
            </div>
          </div>
        </div>
        {/* Live Preview */}
        <div>
          <label className="font-medium flex items-center gap-2 text-blue-700"><Eye className="w-5 h-5" /> Live Email Preview</label>
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/60 min-h-[120px] shadow-inner mt-1 relative">
            <div className="absolute right-3 top-3 text-blue-300 animate-spin" style={{display: sending ? 'block' : 'none'}}><Loader2 className="w-5 h-5" /></div>
            <div dangerouslySetInnerHTML={{__html: previewHtml}} />
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg transition-all text-lg disabled:opacity-60"
            onClick={handleSendTest}
            disabled={sending}
            title="Send a test email to yourself"
          >
            <Eye className="w-5 h-5" /> Send Test
          </button>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg transition-all text-lg disabled:opacity-60"
            onClick={()=>setShowConfirm(true)}
            disabled={sending}
            title="Send to all selected users"
          >
            <Send className="w-5 h-5" /> Send to All
          </button>
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
