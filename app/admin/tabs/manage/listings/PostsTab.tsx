"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye, Mail } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

type Post = {
  id: string;
  content: string;
  postType: string;
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

  // Send email after modal confirm
  async function sendEmail() {
    if (!modalPostId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'POST',
          id: modalPostId,
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
      setModalPostId(null);
    }
  }

  const filteredPosts = posts.filter(p =>
    typeFilter ? p.postType === typeFilter : true
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
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-lg text-blue-700 truncate" title={post.content}>{post.content}</h3>
                <div className="flex gap-2 ml-4">
                  <Link href={`/feed`}>
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="View">
                      <Eye className="w-4 h-4 text-white" />
                    </Button>
                  </Link>
                  <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Email" onClick={() => openEmailModal(post.id)} disabled={loading} title="Email">
                    <Mail className="w-4 h-4 text-white" />
                  </Button>
                  <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(post.id)} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="font-semibold text-gray-600">By:</span>
                <span>{post.person ? `${post.person.firstName} ${post.person.lastName}` : <span className="text-xs text-gray-400">---</span>}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-gray-600">Type:</span>
                <Badge variant="gray">{post.postType.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Badge>
              </div>
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
        onConfirm={sendEmail}
        onCancel={() => { setModalOpen(false); setModalPostId(null); }}
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
