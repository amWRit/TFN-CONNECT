"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
// Person type meta for display
const TYPE_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
	FELLOW:  { bg: "bg-purple-100",   text: "text-purple-700",   icon: "🎓", label: "Fellow" },
	ALUMNI:   { bg: "bg-red-100",      text: "text-red-700",      icon: "⭐",  label: "Alumni" },
	STAFF:    { bg: "bg-blue-100",     text: "text-blue-700",     icon: "👔", label: "Staff" },
	LEADERSHIP: { bg: "bg-yellow-100", text: "text-yellow-800",   icon: "👑", label: "Leadership" },
	ADMIN:    { bg: "bg-green-100",    text: "text-green-700",    icon: "🛡️", label: "Admin" },
};
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface Person {
	id: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	email1: string;
	type: string;
	eduStatus: string;
	empStatus: string;
}

interface Cohort {
	id: string;
	name: string;
}

interface Placement {
	id: string;
	name?: string;
	schoolId: string;
	subjects: string[];
}

export default function PeopleTab() {
	const [editingPerson, setEditingPerson] = useState<Person | null>(null);
	const [people, setPeople] = useState<Person[]>([]);
	const [cohorts, setCohorts] = useState<Cohort[]>([]);
	const [placements, setPlacements] = useState<Placement[]>([]);
	// Filters
	const [personTypes, setPersonTypes] = useState<string[]>([]);
	const [tab, setTab] = useState('ALUMNI');
	const [cohortFilter, setCohortFilter] = useState('');
	const [empStatusFilter, setEmpStatusFilter] = useState('');
	const [nameFilter, setNameFilter] = useState('');

	// Pagination state
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(18); // default 18 like jobs page

	// People filter logic
	const filteredPeople = useMemo(() => {
		let filtered = people;
		if (tab === 'ALL') {
			// Show all
		} else if (tab === 'ALUMNI') {
			filtered = filtered.filter((person: any) => person.type === 'ALUMNI' || person.type === 'STAFF_ALUMNI');
		} else if (tab === 'STAFF') {
			filtered = filtered.filter((person: any) => person.type === 'STAFF' || person.type === 'STAFF_ALUMNI' || person.type === 'STAFF_ADMIN');
		} else {
			filtered = filtered.filter((person: any) => person.type === tab);
		}
		if (tab === 'ALUMNI') {
			if (cohortFilter) {
				filtered = filtered.filter((person: any) => person.fellowships && person.fellowships.some((f: any) => f.cohortId === cohortFilter || (f.cohort && f.cohort.id === cohortFilter)));
			}
			if (empStatusFilter) {
				filtered = filtered.filter((person: any) => person.empStatus === empStatusFilter);
			}
		}
		if (nameFilter) {
			filtered = filtered.filter((person: any) => {
				const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
				return fullName.toLowerCase().includes(nameFilter.toLowerCase());
			});
		}
		// Sort by name ascending
		filtered = [...filtered].sort((a: any, b: any) => {
			const nameA = [a.firstName, a.middleName, a.lastName].filter(Boolean).join(' ').toLowerCase();
			const nameB = [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ').toLowerCase();
			return nameA.localeCompare(nameB);
		});
		return filtered;
	}, [people, tab, cohortFilter, empStatusFilter, nameFilter]);

	// Reset to first page when filters change
	useEffect(() => {
		setPage(1);
	}, [tab, cohortFilter, empStatusFilter, nameFilter]);

	// Compute total pages
	const totalPages = Math.max(1, Math.ceil(filteredPeople.length / pageSize));

	// Paginated people
	const paginatedPeople = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filteredPeople.slice(start, start + pageSize);
	}, [filteredPeople, page, pageSize]);
	// Fetch person types
	useEffect(() => {
		fetch('/api/meta/person-types')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data.types)) setPersonTypes(data.types);
			});
	}, []);

	const [showAddModal, setShowAddModal] = useState(false);
	const [addForm, setAddForm] = useState({
		firstName: '',
		middleName: '',
		lastName: '',
		email1: '',
		type: '',
	});
	const [addSubmitting, setAddSubmitting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [pRes, cRes, plRes] = await Promise.all([
				fetch('/api/people'),
				fetch('/api/cohorts'),
				fetch('/api/placements'),
			]);
			if (pRes.ok) setPeople(await pRes.json());
			if (cRes.ok) setCohorts(await cRes.json());
			if (plRes.ok) setPlacements(await plRes.json());
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	};


	return (
		<div className="space-y-3">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">People</h2>
				<Button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
					+ Add Person
				</Button>
			</div>

			{/* People Filters */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-1.5">
				<div className="flex-1 flex items-center sm:justify-start justify-center">
					<div className="flex items-center gap-4">
						<div className="relative flex items-center">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
								<Users size={18} />
							</span>
							<select
								className="appearance-none pl-9 pr-12 py-2 w-52 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
								value={tab}
								onChange={e => setTab(e.target.value)}
							>
								<option value="ALL">All</option>
								{personTypes.filter((t) => t !== 'ADMIN').map((t) => (
									<option key={t} value={t}>
										{TYPE_META[t]?.label ?? t.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
									</option>
								))}
							</select>
							<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
								<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
							</span>
						</div>
					</div>
				</div>
				<div className="flex-1 flex justify-center">
					<div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-3 py-2 flex flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full">
						{tab === 'ALUMNI' && (
							<>
								<div className="flex items-center gap-2 w-full sm:w-auto">
									<label className="font-semibold text-purple-700">Cohort</label>
									<select
										className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition min-w-[140px]"
										value={cohortFilter}
										onChange={e => setCohortFilter(e.target.value)}
									>
										<option value="">All</option>
										{cohorts.map((c) => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
								</div>
								<div className="flex items-center gap-2 w-full sm:w-auto">
									<label className="font-semibold text-purple-700">Employment</label>
									<select
										className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
										value={empStatusFilter}
										onChange={e => setEmpStatusFilter(e.target.value)}
									>
										<option value="">All</option>
										<option value="EMPLOYED">Employed</option>
										<option value="SEEKING">Seeking</option>
										<option value="UNEMPLOYED">Unemployed</option>
									</select>
								</div>
							</>
						)}
						<div className="flex items-center gap-2 w-full sm:flex-1">
							<label className="font-semibold text-purple-700">Name</label>
							<input
								type="text"
								className="border border-purple-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition w-full min-w-[160px]"
								placeholder="Search by name"
								value={nameFilter}
								onChange={e => setNameFilter(e.target.value)}
							/>
						</div>
					</div>
				</div>
			</div>

			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
					<div className="relative w-full max-w-md mx-2">
						<div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-6 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
							<button
								className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
								onClick={() => setShowAddModal(false)}
								aria-label="Close"
							>
								&times;
							</button>
							<h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Person</h2>
							<form
								onSubmit={async (e) => {
									e.preventDefault();
									if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email1.trim() || !addForm.type) {
										alert('Please fill all required fields');
										return;
									}
									setAddSubmitting(true);
									try {
										const res = await fetch('/api/people', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify(addForm),
										});
										if (res.ok) {
											const person = await res.json();
											setShowAddModal(false);
											setAddForm({ firstName: '', middleName: '', lastName: '', email1: '', type: '' });
											router.push(`/profile?id=${person.id}`);
										} else {
											alert('Failed to create person');
										}
									} catch (error) {
										alert('Error creating person');
									}
									setAddSubmitting(false);
								}}
								className="space-y-5"
							>
								<div className="mb-2 text-xs text-blue-700 text-center font-medium bg-blue-50 rounded p-2">
									After creating a person, you can update more details (education, experience, etc.) from their profile page.
								</div>
								<div className="grid grid-cols-1 gap-3">
									<input
										type="text"
										placeholder="First Name *"
										value={addForm.firstName}
										onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
										className="px-3 py-2 border rounded"
										required
									/>
									<input
										type="text"
										placeholder="Middle Name"
										value={addForm.middleName}
										onChange={e => setAddForm(f => ({ ...f, middleName: e.target.value }))}
										className="px-3 py-2 border rounded"
									/>
									<input
										type="text"
										placeholder="Last Name *"
										value={addForm.lastName}
										onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
										className="px-3 py-2 border rounded"
										required
									/>
									<input
										type="email"
										placeholder="Email *"
										value={addForm.email1}
										onChange={e => setAddForm(f => ({ ...f, email1: e.target.value }))}
										className="px-3 py-2 border rounded"
										required
									/>
									<select
										value={addForm.type}
										onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
										className="px-3 py-2 border rounded"
										required
									>
										<option value="">Select Person Type *</option>
										{personTypes.map((t) => (
											<option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
										))}
									</select>
								</div>
								<div className="flex gap-2 mt-4">
									<button
										type="submit"
										className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
										disabled={addSubmitting}
									>
										{addSubmitting ? 'Creating...' : 'Create'}
									</button>
									<button
										type="button"
										className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
										onClick={() => setShowAddModal(false)}
										disabled={addSubmitting}
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-3 mb-4">
				   {paginatedPeople.map((p) => (
					<Card key={p.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
						<div>
							<h3 className="font-bold">
								{[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')}
							</h3>
							<p className="text-sm text-gray-600">{p.email1}</p>
							<p className="text-xs text-gray-500">{p.type}</p>
						</div>
						<div className="flex gap-2">
							<a href={`/profile?id=${p.id}`} target="_blank" rel="noopener noreferrer">
								<span title="Go to Profile">
									<Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" aria-label="View Profile">
									<span className="sr-only">View Profile</span>
									<Eye className="w-4 h-4" />
									</Button>
								</span>
							</a>
							<span title="Delete Person">
								<Button size="icon" variant="destructive" onClick={async () => {
									if (!window.confirm('Are you sure you want to delete this person?')) return;
									try {
										const res = await fetch(`/api/people/${p.id}`, { method: 'DELETE' });
										if (res.ok) {
											fetchData();
										} else {
											const errorData = await res.json();
											alert(errorData.error || 'Failed to delete person');
										}
									} catch (error) {
										alert('Failed to delete person');
									}
								}} aria-label="Delete">
									<Trash2 className="w-4 h-4" />
								</Button>
							</span>
						</div>
					</Card>
				))}
			</div>

			{/* Pagination Controls */}
			{filteredPeople.length > 0 && (
				<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
					<span>
						Showing {Math.min((page - 1) * pageSize + 1, filteredPeople.length)}–
						{Math.min(page * pageSize, filteredPeople.length)} of {filteredPeople.length}
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
								page === 1
									? "border-gray-200 text-gray-300 cursor-not-allowed"
									: "border-blue-300 text-blue-700 hover:bg-blue-50"
							}`}
						>
							Prev
						</button>
						<select
							value={page}
							onChange={e => setPage(Number(e.target.value))}
							className="border border-blue-200 rounded px-2 py-1 text-xs font-medium"
						>
							{Array.from({ length: totalPages }, (_, i) => (
								<option key={i + 1} value={i + 1}>Page {i + 1}</option>
							))}
						</select>
						<button
							type="button"
							disabled={page >= totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
								page >= totalPages
									? "border-gray-200 text-gray-300 cursor-not-allowed"
									: "border-blue-300 text-blue-700 hover:bg-blue-50"
							}`}
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
}