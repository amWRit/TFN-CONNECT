"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2, Eye } from 'lucide-react';

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
        setTypeOptions([{ value: '', label: 'All Types' }, ...enums.opportunityTypes]);
        setStatusOptions([{ value: '', label: 'All Statuses' }, ...enums.opportunityStatuses]);
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
              <th className="px-4 py-2 text-left">Posted By</th>
              <th className="px-4 py-2 text-left">Type(s)</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpps.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">No opportunities found.</td>
              </tr>
            )}
            {filteredOpps.map(o => (
              <tr key={o.id} className="border-b">
                <td className="px-4 py-2 font-medium">{o.title}</td>
                <td className="px-4 py-2">{o.createdByName || (o.createdBy ? `${o.createdBy.firstName} ${o.createdBy.lastName}` : <span className="text-xs text-gray-400">---</span>)}</td>
                <td className="px-4 py-2">
                  {Array.isArray(o.types) && o.types.length > 0 ? o.types.map((t, i) => (
                    <Badge key={t} variant="secondary" className="mr-1 mb-1 inline-block">{t}</Badge>
                  )) : <span className="text-xs text-gray-400">---</span>}
                </td>
                <td className="px-4 py-2">
                  <Badge variant={statusBadgeVariant(o.status)}>{o.status}</Badge>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <Link href={`/opportunities/${o.id}`}>
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label="View">
                      <Eye className="w-4 h-4 text-white" />
                    </Button>
                  </Link>
                  <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(o.id)} disabled={loading}>
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
