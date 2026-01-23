"use client";

import { useState, useEffect } from 'react';
import { useUserEmail } from '@/lib/useUserEmail';
import { FlaskConical } from 'lucide-react';
import { OkModal } from '@/components/OkModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye, Mail } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

type Opportunity = {
  id: string;
  title: string;
  types: string[];
  status: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdByName?: string;
};

export default function OpportunitiesTab() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All' }]);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All' }]);
  // Email modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOppId, setModalOppId] = useState<string | null>(null);
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<string[]>(['ADMIN']);
  const [selectedEmailField, setSelectedEmailField] = useState<'email1' | 'email2'>('email1');
  const [resultModal, setResultModal] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  // Test email modal state
  const [showTestConfirm, setShowTestConfirm] = useState(false);
  const [showTestOk, setShowTestOk] = useState(false);
  const [testEmail, setTestEmail] = useState<string | null>(null);
  const [testOppId, setTestOppId] = useState<string | null>(null);
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
  function openEmailModal(oppId: string) {
    setModalOppId(oppId);
    setModalOpen(true);
  }

  // Open test email confirmation modal, use session email
  function openTestConfirm(oppId: string) {
    setTestOppId(oppId);
    setShowTestConfirm(true);
    setTestLoading(false);
    setTestEmail(sessionEmail);
  }

  // Send test email using notify route with test flag
  async function sendTestEmail() {
    if (!testOppId) return;
    setTestLoading(true);
    setShowTestConfirm(false);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'OPPORTUNITY', id: testOppId, test: true }),
      });
      setShowTestOk(true);
    } catch {
      setShowTestOk(true);
    }
    setTestLoading(false);
    setTestOppId(null);
  }

  // Send email after modal confirm
  async function sendEmail() {
    if (!modalOppId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OPPORTUNITY',
          id: modalOppId,
          which: selectedEmailField,
          personTypes: selectedPersonTypes,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setResultModal({
          open: true,
          message: `Email sent to ${selectedEmailField === 'email1' ? 'primary' : 'secondary'} email for selected person types. (${result.count} notified)`,
          success: true,
        });
      } else {
        setResultModal({ open: true, message: 'Failed to send email notification', success: false });
      }
    } catch (e) {
      setResultModal({ open: true, message: 'Error sending email notification', success: false });
    } finally {
      setLoading(false);
      setModalOpen(false);
      setModalOppId(null);
    }
  }

  useEffect(() => {
    fetchOpps();
    fetchEnums();
  }, []);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpps(data);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchEnums = async () => {
    try {
      const res = await fetch('/api/opportunities/enums');
      if (res.ok) {
        const enums = await res.json();
        setTypeOptions([{ value: '', label: 'All' }, ...enums.opportunityTypes]);
        setStatusOptions([{ value: '', label: 'All ' }, ...enums.opportunityStatuses]);
      }
    } catch (e) {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this opportunity?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOpps();
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredOpps = opps.filter(o =>
    (typeFilter ? o.types?.includes(typeFilter) : true) &&
    (statusFilter ? o.status === statusFilter : true)
  );

  function statusBadgeVariant(status: string) {
    switch (status) {
      case 'OPEN': return 'green'; // custom green
      case 'CLOSED': return 'destructive'; // red
      default: return 'outline';
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters: type and status grouped horizontally, compact like PeopleTab */}
        <div className="mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-1.5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 w-full">
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <label className="font-semibold text-blue-700">Type</label>
              <select
                className="appearance-none pl-3 pr-10 py-2 w-full sm:w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                {typeOptions.map(opt => (
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
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpps.length === 0 && (
                <div className="col-span-full text-center py-6 text-gray-400">No opportunities found.</div>
              )}
              {filteredOpps.map(o => (
                <div key={o.id} className="bg-white border border-blue-400 rounded-xl shadow-sm p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-blue-700 truncate" title={o.title}>{o.title}</h3>
                    <Badge variant={statusBadgeVariant(o.status)}>{o.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="font-semibold text-gray-600">Type(s):</span>
                    {o.types?.map(type => (
                      <Badge key={type} variant="gray">{type}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="font-semibold text-gray-600">Posted By:</span>
                    <span>{o.createdByName || (o.createdBy ? `${o.createdBy.firstName} ${o.createdBy.lastName}` : <span className="text-xs text-gray-400">---</span>)}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/opportunities/${o.id}`}>
                      <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="View">
                        <Eye className="w-4 h-4 text-white" />
                      </Button>
                    </Link>
                    <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Email" onClick={() => openEmailModal(o.id)} disabled={loading} title="Email">
                      <Mail className="w-4 h-4 text-white" />
                    </Button>
                    <Button size="icon" className="bg-yellow-500 hover:bg-yellow-600 text-white" aria-label="Test Email" onClick={() => openTestConfirm(o.id)} disabled={loading} title="Send test email to yourself">
                      <FlaskConical className="w-4 h-4 text-white" />
                    </Button>
                    <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(o.id)} disabled={loading}>
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
                      onCancel={() => { setShowTestConfirm(false); setTestOppId(null); setTestEmail(null); }}
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

          {/* Email Modal */}
          <ConfirmModal
            open={modalOpen}
            title="Send Opportunity Notification"
            message={''}
            confirmText={loading ? 'Sending...' : 'Send'}
            cancelText="Cancel"
            onConfirm={sendEmail}
            onCancel={() => { setModalOpen(false); setModalOppId(null); }}
            loading={loading}
          >
            <div className="mb-4 w-full">
              <label className="block font-semibold mb-2 text-blue-700">Select Person Types:</label>
              <div className="flex flex-wrap gap-2">
                {PERSON_TYPES.map(pt => (
                  <label key={pt} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedPersonTypes.includes(pt)}
                      onChange={e => {
                        if (e.target.checked) setSelectedPersonTypes([...selectedPersonTypes, pt]);
                        else setSelectedPersonTypes(selectedPersonTypes.filter(t => t !== pt));
                      }}
                    />
                    <span className="text-sm">{pt.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </label>
                ))}
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
          </ConfirmModal>

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
        </div>
        {/* Test Email Progress Bar (global, not per-opportunity) and blur */}
        {testLoading && (
          <>
            <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] transition-all" />
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold flex items-center gap-2 animate-pulse z-50">
              <FlaskConical className="w-5 h-5 animate-spin" />
              Sending test email...
            </div>
          </>
        )}
      </div>
    </>
  );
}
