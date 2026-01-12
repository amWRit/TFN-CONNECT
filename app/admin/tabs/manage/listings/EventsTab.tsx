"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye } from 'lucide-react';

type Event = {
  id: string;
  title: string;
  type: string;
  status: string;
};

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Types' }]);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'All Statuses' }]);

  useEffect(() => {
    fetchEvents();
    fetchEnums();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchEnums = async () => {
    try {
      const res = await fetch('/api/events/enums');
      if (res.ok) {
        const enums = await res.json();
        setTypeOptions([{ value: '', label: 'All Types' }, ...enums.eventTypes]);
        setStatusOptions([{ value: '', label: 'All Statuses' }, ...enums.eventStatuses]);
      }
    } catch (e) {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) fetchEvents();
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e =>
    (typeFilter ? e.type === typeFilter : true) &&
    (statusFilter ? e.status === statusFilter : true)
  );

  function statusBadgeVariant(status: string) {
    switch (status) {
      case 'DRAFT': return 'outline';
      case 'PUBLISHED': return 'default';
      case 'CANCELLED': return 'destructive';
      case 'COMPLETED': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center mb-4">
        <label className="font-semibold text-blue-700">Type</label>
        <div className="relative">
          <select
            className="pl-3 pr-10 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base appearance-none"
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
        <label className="font-semibold text-blue-700 ml-6">Status</label>
        <div className="relative">
          <select
            className="pl-3 pr-10 py-2 w-40 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base appearance-none"
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
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">No events found.</td>
              </tr>
            )}
            {filteredEvents.map(e => (
              <tr key={e.id} className="border-b">
                <td className="px-4 py-2 font-medium">{e.title}</td>
                <td className="px-4 py-2">
                  <Badge variant="secondary">{e.type}</Badge>
                </td>
                <td className="px-4 py-2">
                  <Badge variant={statusBadgeVariant(e.status)}>{e.status}</Badge>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Link href={`/events/${e.id}`}>
                    <Button size="icon" variant="outline" aria-label="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(e.id)} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
