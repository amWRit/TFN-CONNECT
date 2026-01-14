import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SubscriptionType, PersonType } from '@prisma/client';
import { Mail, Image as ImageIcon, Eye, Send } from 'lucide-react';
// Dynamic imports for editors
const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function AdminEmailPage() {
  // Form state
  const [subject, setSubject] = useState('');
  const [ccList, setCcList] = useState('');
  const [recipientType, setRecipientType] = useState<SubscriptionType>('EVENT');
  const [personType, setPersonType] = useState<PersonType | ''>('');
  const [emailPreference, setEmailPreference] = useState<'primary' | 'secondary' | 'both'>('primary');
  const [bodyTab, setBodyTab] = useState<'visual' | 'markdown' | 'html'>('visual');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = {
      subject, ccList, recipientType, personType, emailPreference, bodyTab, body, images
    };
    localStorage.setItem('adminEmailDraft', JSON.stringify(draft));
  }, [subject, ccList, recipientType, personType, emailPreference, bodyTab, body, images]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('adminEmailDraft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setSubject(d.subject || '');
        setCcList(d.ccList || '');
        setRecipientType(d.recipientType || 'EVENT');
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
          subscriptionType: recipientType,
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
  }, [recipientType, personType, emailPreference]);

  // Live preview
  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch('/api/admin/email/preview', {
          method: 'POST',
          import { Mail } from 'lucide-react';
          import AdminEmailForm from '../../../components/AdminEmailForm';

          export default function AdminEmailPage() {
            return (
              <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                  <Mail className="w-6 h-6" /> Custom Admin Email
                </h1>
                <AdminEmailForm />
              </div>
            );
          }
  const handleImageUpload = async (files: FileList) => {
