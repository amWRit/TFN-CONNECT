"use client";

import { useState, useEffect, useRef } from 'react';
import { useUserEmail } from '@/lib/useUserEmail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye, Mail, FlaskConical } from 'lucide-react';
import Modal from '@/components/Modal';
import { PostCard } from '@/components/PostCard';
import ConfirmModal from '@/components/ConfirmModal';
import OkModal from '@/components/OkModal';

type Post = {
  id: string;
  content: string;
  postType: string;
  createdAt?: string; // Added createdAt property
  person?: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

const POST_TYPES = [
  'CAREER_UPDATE',
  'ACHIEVEMENT',
  'CERTIFICATION',
  'JOB_POSTING',
  'JOB_APPLICATION',
  'EVENT_ANNOUNCEMENT',
  'EVENT_RSVP',
  'ARTICLE_SHARE',
  'RESOURCE_SHARE',
  'SEEK_COLLABORATION',
  'SEEK_MENTOR',
  'OFFER_MENTORSHIP',
  'GENERAL',
];

export default function PostsTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  // Email modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  // Post details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsPost, setDetailsPost] = useState<Post | null>(null);
    // Open post details modal
    function openDetailsModal(post: Post) {
      setDetailsPost(post);
      setDetailsModalOpen(true);
    }

    function closeDetailsModal() {
      setDetailsModalOpen(false);
      setDetailsPost(null);
    }
  const [selectedPersonType, setSelectedPersonType] = useState<string>('ADMIN');
  const [selectedEmailField, setSelectedEmailField] = useState<'email1' | 'email2'>('email1');
  const [resultModal, setResultModal] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  // Test email modal state
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showTestOk, setShowTestOk] = useState(false);
  const [testEmail, setTestEmail] = useState<string | null>(null);
  const [testPostId, setTestPostId] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const sessionEmail = useUserEmail();
  // Batch email modal and progress state
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{sent:number, failed:string[], batchResults:any[]}|null>(null);
  const [sentCsvUrl, setSentCsvUrl] = useState<{ url: string; filename: string } | null>(null);
  const [csvDownloadTriggered, setCsvDownloadTriggered] = useState(false);
  const csvDownloadRef = useRef<HTMLAnchorElement | null>(null);
  const PERSON_TYPES = [
    'FELLOW',
    'ALUMNI',
    'STAFF',
    'ADMIN',
    'STAFF_ADMIN',
    'STAFF_ALUMNI',
    'LEADERSHIP',
    'GENERAL',
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feed');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };


  // Open modal for email
  function openEmailModal(postId: string) {
    setModalPostId(postId);
    setModalOpen(true);
  }

  // Open test email confirmation modal, use session email
  function openTestConfirm(postId: string) {
    setTestPostId(postId);
    setShowTestConfirm(true);
    setTestLoading(false);
    setTestEmail(sessionEmail);
  }


  // Send email after confirm
  async function sendEmail() {
    console.log('sendEmail called', { modalPostId, selectedPersonType, selectedEmailField });
    if (!modalPostId) return;
    setShowConfirm(false);
    setEmailLoading(true);
    setBatchProgress(null);
    setSentCsvUrl(null);
    setCsvDownloadTriggered(false);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'POST',
          id: modalPostId,
          which: selectedEmailField,
          personTypes: selectedPersonType ? [selectedPersonType] : [],
          adminauth: true,
        }),
      });
      const result = await res.json();
      let sent = result.count || 0;
      let failed = result.failed || [];
      let batchResults = result.batchResults || [];
      setBatchProgress({ sent, failed, batchResults });
      // Prepare CSV of sent emails if available
      if (result.sentEmails && Array.isArray(result.sentEmails) && result.sentEmails.length > 0) {
        const csv = 'email\n' + result.sentEmails.map((e:any) => e).join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const filename = 'posts-notify-email.csv';
        const url = URL.createObjectURL(blob);
        setSentCsvUrl({ url, filename });
      }
      setResultModal({
        open: true,
        message: `Sent to ${sent} users. Failed: ${failed.length}`,
        success: failed.length === 0,
      });
    } catch (e) {
      setBatchProgress({sent: 0, failed: [], batchResults: []});
      setResultModal({ open: true, message: 'Failed to send email notification', success: false });
    }
    setEmailLoading(false);
    setModalOpen(false);
    setModalPostId(null);
  }
  // Fetch recipient count when person types or email field changes, or when modal opens
  useEffect(() => {
    if (!modalOpen) return;
    async function fetchCount() {
      try {
        const params = new URLSearchParams();
        if (selectedPersonType) params.append('personType', selectedPersonType);
        params.append('emailPreference', selectedEmailField);
        const res = await fetch(`/api/admin/email/recipients?${params}`);
        const data = await res.json();
        let emails: string[] = [];
        if (Array.isArray(data.users)) {
          if (selectedEmailField === 'email1') {
            emails = data.users.map((u:any) => u.email1).filter(Boolean);
          } else if (selectedEmailField === 'email2') {
            emails = data.users.map((u:any) => u.email2).filter(Boolean);
          }
        }
        // Deduplicate emails
        const uniqueEmails = Array.from(new Set(emails));
        setRecipientEmails(uniqueEmails);
        setRecipientCount(uniqueEmails.length);
      } catch {
        setRecipientCount(0);
        setRecipientEmails([]);
      }
    }
    fetchCount();
  }, [modalOpen, selectedPersonType, selectedEmailField]);

  // Auto-hide batch progress bar and CSV after sending is complete
  useEffect(() => {
    if (batchProgress && !loading) {
      const timeout = setTimeout(() => {
        setBatchProgress(null);
        setSentCsvUrl(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [batchProgress, loading]);

  // Remove Blob URL after batch progress is hidden to avoid memory leaks
  useEffect(() => {
    return () => {
      if (sentCsvUrl) {
        URL.revokeObjectURL(sentCsvUrl.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentCsvUrl]);

  // Auto-download CSV when ready (robust: use ref)
  useEffect(() => {
    if (sentCsvUrl && !csvDownloadTriggered) {
      const timeout = setTimeout(() => {
        if (csvDownloadRef.current) {
          csvDownloadRef.current.click();
          setCsvDownloadTriggered(true);
        }
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [sentCsvUrl, csvDownloadTriggered]);

  // Send test email using notify route with test flag
  async function sendTestEmail() {
    if (!testPostId) return;
    setTestLoading(true);
    setShowTestConfirm(false);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'POST', id: testPostId, test: true }),
      });
      setShowTestOk(true);
    } catch {
      setShowTestOk(true);
    }
    setTestLoading(false);
    setTestPostId(null);
  }

  const filteredPosts = posts.filter(p =>
    typeFilter ? p.postType === typeFilter : true
  );

  return (
    <>
      {/* Test Email Progress Bar (global, not per-post) and blur */}
      {testLoading && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-all" />
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50">
            <FlaskConical className="w-5 h-5 animate-spin" />
            Sending test email...
          </div>
        </>
      )}
      {/* Batch Progress Bar & CSV Download */}
      {(emailLoading || batchProgress) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50">
          <Mail className="w-5 h-5 animate-spin" />
          {loading ? 'Sending...' : (
            <>
              Sent: {batchProgress?.sent} &nbsp;| Failed: {batchProgress?.failed.length} &nbsp;| Remaining: {recipientCount - (batchProgress?.sent ?? 0) - (batchProgress?.failed.length ?? 0)}
              {sentCsvUrl && (
                <>
                  &nbsp;|&nbsp;
                  <a
                    href={sentCsvUrl.url}
                    download={sentCsvUrl.filename}
                    className="underline text-white font-bold"
                    style={{ display: 'inline' }}
                  >Download Sent CSV</a>
                  <a
                    href={sentCsvUrl.url}
                    download={sentCsvUrl.filename}
                    style={{ display: 'none' }}
                    ref={csvDownloadRef}
                  >hidden</a>
                </>
              )}
            </>
          )}
        </div>
      )}
      <div className="space-y-6">
        <div className="flex gap-4 items-center mb-4">
          <label className="font-semibold text-blue-700">Type</label>
          <div className="relative">
            <select
              className="pl-3 pr-10 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base appearance-none"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {POST_TYPES.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </div>
        {loading && (
          <div className="w-full text-center py-8 text-blue-600 font-semibold text-lg animate-pulse">Loading posts...</div>
        )}
        <div className="grid grid-cols-1 gap-2">
          {filteredPosts.length === 0 && !loading && (
            <div className="col-span-full text-center py-6 text-gray-400">No posts found.</div>
          )}
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white border border-blue-400 rounded-xl shadow-sm p-3 flex flex-col gap-1.5">
              <div className="mb-1">
                <h3 className="font-bold text-lg text-blue-700 truncate" title={post.content}>{post.content}</h3>
              </div>
              <div className="flex flex-wrap gap-2 items-center text-sm justify-between">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold text-gray-600">By:</span>
                  <span>{post.person ? `${post.person.firstName} ${post.person.lastName}` : <span className="text-xs text-gray-400">---</span>}</span>
                  <span className="text-gray-400">|</span>
                  <span className="font-semibold text-gray-600">Type:</span>
                  <Badge variant="gray">{post.postType.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Badge>
                </div>
                <div className="flex gap-2 items-center ml-auto">
                  <Button
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label="View"
                    onClick={() => openDetailsModal(post)}
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </Button>
                  {/* Post Details Modal */}
                  <Modal open={detailsModalOpen} onClose={closeDetailsModal}>
                    {detailsPost && (
                      <div className="w-full">
                        <PostCard
                          postId={detailsPost.id}
                          author={{
                            id: detailsPost.person?.id || '',
                            firstName: detailsPost.person?.firstName || 'Unknown',
                            lastName: detailsPost.person?.lastName || '',
                          }}
                          content={detailsPost.content}
                          postType={detailsPost.postType}
                          likes={(detailsPost as any).likes ?? 0}
                          comments={(detailsPost as any).comments ?? 0}
                          createdAt={detailsPost.createdAt ? new Date(detailsPost.createdAt) : new Date()}
                          hideBookmark
                          hideStats
                          adminView
                        />
                      </div>
                    )}
                  </Modal>
                  <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Email" onClick={() => openEmailModal(post.id)} disabled={loading} title="Email">
                    <Mail className="w-4 h-4 text-white" />
                  </Button>
                  <Button size="icon" className="bg-yellow-500 hover:bg-yellow-600 text-white" aria-label="Test Email" onClick={() => openTestConfirm(post.id)} disabled={loading} title="Send test email to yourself">
                    <FlaskConical className="w-4 h-4 text-white" />
                  </Button>
                  <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(post.id)} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Test Email Confirmation Modal */}
              {showTestConfirm && (
                <ConfirmModal
                  open={showTestConfirm}
                  title="Send Test Email"
                  message={testLoading ? 'Sending test email...' : `You are about to send a test email to yourself${testEmail ? `: ${testEmail}` : ''}. Continue?`}
                  confirmText={testLoading ? 'Sending...' : 'Send Test'}
                  cancelText="Cancel"
                  onConfirm={sendTestEmail}
                  onCancel={() => { setShowTestConfirm(false); setTestPostId(null); setTestEmail(null); }}
                  loading={testLoading}
                />
              )}

              {/* Test Email Ok Modal */}
              <OkModal
                open={showTestOk}
                title="Test Email Sent"
                message={testEmail ? `A test email was sent to ${testEmail}.` : 'A test email was sent.'}
                onOk={() => { setShowTestOk(false); setTestEmail(null); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Email Modal */}
      <ConfirmModal
        open={modalOpen}
        title="Send Post Notification"
        message={''}
        confirmText={loading ? 'Sending...' : 'Send'}
        cancelText="Cancel"
        onConfirm={() => setShowConfirm(true)}
        onCancel={() => { setModalOpen(false); setModalPostId(null); setShowConfirm(false); }}
        loading={loading}
      >
        <div className="mb-4 w-full">
          <label className="block font-semibold mb-2 text-blue-700">Select Person Type:</label>
          <div className="relative w-full">
            <select
              className="appearance-none pl-3 pr-10 py-2 w-full border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
              value={selectedPersonType}
              onChange={e => setSelectedPersonType(e.target.value)}
            >
              {PERSON_TYPES.map(pt => (
                <option key={pt} value={pt}>{pt.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </div>
        <div className="mb-4 w-full">
          <label className="block font-semibold mb-2 text-blue-700">Select Email Field:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="emailField"
                value="email1"
                checked={selectedEmailField === 'email1'}
                onChange={() => setSelectedEmailField('email1')}
              />
              <span className="text-sm">Primary Email</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="emailField"
                value="email2"
                checked={selectedEmailField === 'email2'}
                onChange={() => setSelectedEmailField('email2')}
              />
              <span className="text-sm">Secondary Email</span>
            </label>
          </div>
        </div>
        <div className="mb-2 w-full text-xs text-pink-600 flex items-center gap-1">
          Will send to <span className="font-bold">{recipientCount}</span> users
        </div>
        {recipientEmails.length > 0 && (
          <div className="w-full text-xs text-gray-500 max-h-32 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2">
            <div className="mb-1 font-semibold text-blue-700">Emails:</div>
            <ul className="list-disc ml-5">
              {recipientEmails.map(email => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmModal>

      {/* Confirmation Modal before sending */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full border-2 border-pink-200 flex flex-col items-center">
            <Mail className="w-10 h-10 text-pink-500 mb-2 animate-bounce" />
            <h2 className="text-xl font-bold mb-2 text-blue-700">
              Send to {recipientCount} users?
            </h2>
            <p className="mb-4 text-gray-600 text-center">
              This can't be undone. Are you sure you want to send this post notification to <span className="font-bold text-pink-600">{recipientCount}</span> users?
            </p>
            <div className="flex gap-4 mt-2">
              <button
                className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-60"
                onClick={()=>setShowConfirm(false)}
                disabled={loading}
              >Cancel</button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow transition-all disabled:opacity-60"
                onClick={() => { console.log('Send button clicked'); sendEmail(); }}
                disabled={loading}
              >Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <ConfirmModal
        open={resultModal.open}
        title={resultModal.success ? 'Success' : 'Error'}
        message={resultModal.message}
        confirmText="OK"
        onConfirm={() => setResultModal({ ...resultModal, open: false })}
        onCancel={() => setResultModal({ ...resultModal, open: false })}
        loading={false}
      />
    </>
  );
}
