"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye, Mail } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

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

function typeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  return "secondary"; // always use secondary for type
}


export default function JobsTab() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeOptions, setJobTypeOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Types' }]);
  const [jobStatusOptions, setJobStatusOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Statuses' }]);
  // Email modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJobId, setModalJobId] = useState<string | null>(null);
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<string[]>(['ADMIN']);
  const [selectedEmailField, setSelectedEmailField] = useState<'email1' | 'email2'>('email1');
  const [resultModal, setResultModal] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
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
  }

  // Send email after modal confirm
  async function sendEmail() {
    if (!modalJobId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'JOB_POSTING',
          id: modalJobId,
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
      setModalJobId(null);
    }
  }

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
        setJobTypeOptions([{ value: '', label: 'All Types' }, ...enums.jobTypes]);
        setJobStatusOptions([{ value: '', label: 'All Statuses' }, ...enums.jobStatuses]);
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
      <div className="space-y-6">
        <div className="flex gap-4 items-center mb-4">
          <label className="font-semibold text-blue-700">Type</label>
          <div className="relative">
            <select
              className="pl-3 pr-10 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base appearance-none"
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
          <label className="font-semibold text-blue-700 ml-6">Status</label>
          <div className="relative">
            <select
              className="pl-3 pr-10 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base appearance-none"
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Posted By</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">No job postings found.</td>
                </tr>
              )}
              {filteredJobs.map(job => (
                <tr key={job.id} className="border-b">
                  <td className="px-4 py-2 font-medium">{job.title}</td>
                  <td className="px-4 py-2">{job.createdBy ? `${job.createdBy.firstName} ${job.createdBy.lastName}` : <span className="text-xs text-gray-400">---</span>}</td>
                  <td className="px-4 py-2">
                    <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={typeBadgeVariant(job.jobType)}>{job.jobType}</Badge>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="View">
                        <Eye className="w-4 h-4 text-white" />
                      </Button>
                    </Link>
                    <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Email" onClick={() => openEmailModal(job.id)} disabled={loading} title="Email">
                      <Mail className="w-4 h-4 text-white" />
                    </Button>
                    <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(job.id)} disabled={loading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Email Modal */}
      <ConfirmModal
        open={modalOpen}
        title="Send Job Notification"
        message={''}
        confirmText={loading ? 'Sending...' : 'Send Email'}
        cancelText="Cancel"
        onConfirm={sendEmail}
        onCancel={() => { setModalOpen(false); setModalJobId(null); }}
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
    </>
  );
}
