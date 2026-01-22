
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useUserEmail } from '@/lib/useUserEmail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye, Mail, FlaskConical } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { OkModal } from '@/components/OkModal';

type JobPosting = {
  id: string;
  title: string;
  jobType: string;
  status: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
};



function statusBadgeVariant(status: string) {
  switch (status) {
    case 'OPEN': return 'green'; // custom green
    case 'CLOSED': return 'destructive'; // red
    case 'FILLED': return 'gray'; // custom gray
    case 'PAUSED': return 'outline';
    case 'DRAFT': return 'outline';
    default: return 'outline';
  }
}

function typeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" | "gray" {
  return "gray";
}


export default function JobsTab() {
  const csvDownloadRef = useRef<HTMLAnchorElement | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeOptions, setJobTypeOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Types' }]);
  const [jobStatusOptions, setJobStatusOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Statuses' }]);
  // Email modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJobId, setModalJobId] = useState<string | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<string>('ADMIN');
  const [selectedEmailField, setSelectedEmailField] = useState<'email1' | 'email2'>('email1');
  const [resultModal, setResultModal] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  // Recipient count and user emails for selected person types
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  // Show confirm modal before sending
  const [showConfirm, setShowConfirm] = useState(false);
  // Batch progress state
  const [batchProgress, setBatchProgress] = useState<{sent:number, failed:string[], batchResults:any[]}|null>(null);
  // CSV download state
  const [sentCsvUrl, setSentCsvUrl] = useState<{ url: string; filename: string } | null>(null);
  const [csvDownloadTriggered, setCsvDownloadTriggered] = useState(false);
 // Test email modal state
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showTestOk, setShowTestOk] = useState(false);
  const [testEmail, setTestEmail] = useState<string | null>(null);
  const [testJobId, setTestJobId] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  // Get current user's email from session
  const sessionEmail = useUserEmail();
  
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
  // Open modal for email
  function openEmailModal(jobId: string) {
    setModalJobId(jobId);
    setModalOpen(true);
    setShowConfirm(false);
    setBatchProgress(null);
    setSentCsvUrl(null);
    setCsvDownloadTriggered(false);
  }

  // Send email after confirm
  async function sendEmail() {
    if (!modalJobId) return;
    setShowConfirm(false);
    setLoading(true);
    setBatchProgress(null);
    setSentCsvUrl(null);
    setCsvDownloadTriggered(false);
    try {
      // Send notification (batching handled in API)
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'JOB_POSTING',
          id: modalJobId,
          which: selectedEmailField,
          personTypes: selectedPersonType ? [selectedPersonType] : [],
        }),
      });
      const result = await res.json();
      console.log('Notify API result:', result); // DEBUG
      // Assume result has: count, failed (array), batchResults (array of batch info)
      let sent = result.count || 0;
      let failed = result.failed || [];
      let batchResults = result.batchResults || [];
      setBatchProgress({ sent, failed, batchResults });
      // Prepare CSV of sent emails if available
      if (result.sentEmails && Array.isArray(result.sentEmails) && result.sentEmails.length > 0) {
        const csv = 'email\n' + result.sentEmails.map((e:any) => e).join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const filename = 'jobs-notify-email.csv';
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
    setLoading(false);
    setModalOpen(false);
    setModalJobId(null);
  }

  
  // Get current user's email for test (from session API)
  async function fetchMyEmail() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        return data.email1 || data.email || null;
      }
    } catch {}
    return null;
  }

  // Open test email confirmation modal, use session email
  function openTestConfirm(jobId: string) {
    setTestJobId(jobId);
    setShowTestConfirm(true);
    setTestLoading(false);
    setTestEmail(sessionEmail);
  }

  // Send test email using notify route with test flag
  async function sendTestEmail() {
    if (!testJobId) return;
    setTestLoading(true);
    setShowTestConfirm(false);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'JOB_POSTING', id: testJobId, test: true }),
      });
      if (res.ok) {
        setShowTestOk(true);
      } else {
        setShowTestOk(true);
      }
    } catch {
      setShowTestOk(true);
    }
    setTestLoading(false);
    setTestJobId(null);
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
        setRecipientCount(data.count || 0);
        // Extract emails from users array
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

  useEffect(() => {
    fetchJobs();
    fetchEnums();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchEnums = async () => {
    try {
      const res = await fetch('/api/jobs/enums');
      if (res.ok) {
        const enums = await res.json();
        setJobTypeOptions([{ value: '', label: 'All' }, ...enums.jobTypes]);
        setJobStatusOptions([{ value: '', label: 'All' }, ...enums.jobStatuses]);
      }
    } catch (e) {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job posting?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchJobs();
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(j =>
    (typeFilter ? j.jobType === typeFilter : true) &&
    (statusFilter ? j.status === statusFilter : true)
  );

  return (
    <>
      {/* Test Email Progress Bar (global, not per-job) */}
      {testLoading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50">
          <FlaskConical className="w-5 h-5 animate-spin" />
          Sending test email...
        </div>
      )}
      <div className="space-y-6">
        {/* Filters: type and status, responsive layout */}
        <div className="mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-1.5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 w-full">
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <label className="font-semibold text-blue-700">Type</label>
              <select
                className="appearance-none pl-3 pr-10 py-2 w-full sm:w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                {jobTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <label className="font-semibold text-blue-700">Status</label>
              <select
                className="appearance-none pl-3 pr-10 py-2 w-full sm:w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {jobStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
        </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.length === 0 && (
                <div className="col-span-full text-center py-6 text-gray-400">No jobs found.</div>
              )}
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-white border border-blue-400 rounded-xl shadow-sm p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-blue-700 truncate" title={job.title}>{job.title}</h3>
                    <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="font-semibold text-gray-600">Type:</span>
                    <Badge variant={typeBadgeVariant(job.jobType)}>{job.jobType}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="font-semibold text-gray-600">Posted By:</span>
                    <span>{job.createdBy ? `${job.createdBy.firstName} ${job.createdBy.lastName}` : <span className="text-xs text-gray-400">---</span>}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="View">
                        <Eye className="w-4 h-4 text-white" />
                      </Button>
                    </Link>
                    <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Email" onClick={() => openEmailModal(job.id)} disabled={loading} title="Email">
                      <Mail className="w-4 h-4 text-white" />
                    </Button>
                    <Button size="icon" className="bg-yellow-500 hover:bg-yellow-600 text-white" aria-label="Test Email" onClick={() => openTestConfirm(job.id)} disabled={loading} title="Send test email to yourself">
                      <FlaskConical className="w-4 h-4 text-white" />
                    </Button>
                    <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(job.id)} disabled={loading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                          onCancel={() => { setShowTestConfirm(false); setTestJobId(null); setTestEmail(null); }}
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
        title="Send Job Notification"
        message={''}
        confirmText={loading ? 'Sending...' : 'Send'}
        cancelText="Cancel"
        onConfirm={() => setShowConfirm(true)}
        onCancel={() => { setModalOpen(false); setModalJobId(null); setShowConfirm(false); }}
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
          <div className="mb-2 w-full text-xs text-gray-500 max-h-32 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2">
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
              This can't be undone. Are you sure you want to send this job notification to <span className="font-bold text-pink-600">{recipientCount}</span> users?
            </p>
            <div className="flex gap-4 mt-2">
              <button
                className="bg-gray-100 px-4 py-2 rounded-full font-semibold text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-60"
                onClick={()=>setShowConfirm(false)}
                disabled={loading}
              >Cancel</button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow transition-all disabled:opacity-60"
                onClick={sendEmail}
                disabled={loading}
              >Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Progress Bar & CSV Download */}
      {(loading || batchProgress) && (
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
