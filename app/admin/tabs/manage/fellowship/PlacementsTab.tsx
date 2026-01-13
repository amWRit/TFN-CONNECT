// PlacementsTab full code migrated from oldtabs/PlacementsTab
'use client';

import { useState, useEffect, useMemo } from 'react';
import { EditPostModal } from '@/components/EditPostModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, User } from 'lucide-react';

interface Placement {
	id: string;
	name?: string;
	schoolId: string;
	managerId: string;
	fellowCount: number;
	subjects: string[];
	school?: School;
	manager?: Person;
}

interface School {
	id: string;
	name: string;
}

interface Person {
	id: string;
	firstName: string;
	lastName: string;
	type: string;
}

export default function PlacementsTab() {
	const [placements, setPlacements] = useState<Placement[]>([]);
	const [schools, setSchools] = useState<School[]>([]);
	const [staffMembers, setStaffMembers] = useState<Person[]>([]);


	       // Filters
	       const [managerFilter, setManagerFilter] = useState('');
	       const [nameFilter, setNameFilter] = useState('');
	       // Filtered placements
	       const filteredPlacements = useMemo(() => {
		       let filtered = placements;
		       if (managerFilter) {
			       filtered = filtered.filter((p) => p.managerId === managerFilter);
		       }
		       if (nameFilter) {
			       filtered = filtered.filter((p) => (p.name || '').toLowerCase().includes(nameFilter.toLowerCase()));
		       }
		       return filtered;
	       }, [placements, managerFilter, nameFilter]);

	const [showAddModal, setShowAddModal] = useState(false);
	const [form, setForm] = useState({
		name: '',
		schoolId: '',
		managerId: '',
		fellowCount: 0,
		subjects: [] as string[],
	});
	const [editId, setEditId] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editError, setEditError] = useState('');
	const [editSubmitting, setEditSubmitting] = useState(false);
	const [editAction, setEditAction] = useState<'save' | 'delete' | null>(null);

	// Delete placement state and handler for ConfirmModal
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const handleDelete = async () => {
		if (!deleteId) return;
		setDeleteLoading(true);
		try {
			const res = await fetch(`/api/placements/${deleteId}`, { method: 'DELETE' });
			if (res.ok) {
				setPlacements((prev) => prev.filter((p) => p.id !== deleteId));
				setDeleteId(null);
			} else {
				alert('Failed to delete placement');
			}
		} catch (err) {
			alert('Error deleting placement');
		} finally {
			setDeleteLoading(false);
		}
	};

	const fetchData = async () => {
		try {
			const [pRes, sRes, staffRes] = await Promise.all([
				fetch('/api/placements'),
				fetch('/api/schools'),
				fetch('/api/people?types=STAFF,STAFF_ALUMNI,STAFF_ADMIN'),
			]);
			if (pRes.ok) setPlacements(await pRes.json());
			if (sRes.ok) setSchools(await sRes.json());
			if (staffRes.ok) setStaffMembers(await staffRes.json());
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSubjectToggle = (subject: string) => {
		setForm((prev) => ({
			...prev,
			subjects: prev.subjects.includes(subject)
				? prev.subjects.filter((s) => s !== subject)
				: [...prev.subjects, subject],
		}));
	};

	const createPlacement = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name || !form.schoolId || !form.managerId || form.subjects.length === 0) {
			alert('Please fill all required fields');
			return;
		}

		try {
			let res;
			if (editId) {
				// Edit mode
				res = await fetch(`/api/placements/${editId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form),
				});
			} else {
				// Create mode
				res = await fetch('/api/placements', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form),
				});
			}
			if (res.ok) {
				setForm({ name: '', schoolId: '', managerId: '', fellowCount: 0, subjects: [] });
				setShowAddModal(false);
				setEditId(null);
				fetchData();
			} else {
				alert('Failed to save placement');
			}
		} catch (error) {
			console.error('Failed to save placement:', error);
		}
	};

	// Modal edit handlers
	const handleEditOpen = (placement: Placement) => {
		setEditId(placement.id);
		setForm({
			name: placement.name || '',
			schoolId: placement.schoolId || '',
			managerId: placement.managerId ? String(placement.managerId) : '',
			fellowCount: placement.fellowCount,
			subjects: placement.subjects || [],
		});
		setShowEditModal(true);
		setEditError('');
		setEditAction(null);
	};

	const handleEditClose = () => {
		setShowEditModal(false);
		setEditId(null);
		setForm({ name: '', schoolId: '', managerId: '', fellowCount: 0, subjects: [] });
		setEditError('');
		setEditAction(null);
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setEditSubmitting(true);
		setEditAction('save');
		setEditError('');
		if (!form.name || !form.schoolId || !form.managerId || form.subjects.length === 0) {
			setEditError('Please fill all required fields');
			setEditSubmitting(false);
			setEditAction(null);
			return;
		}
		try {
			const res = await fetch(`/api/placements/${editId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});
			if (res.ok) {
				handleEditClose();
				fetchData();
			} else {
				setEditError('Failed to save placement');
			}
		} catch (error) {
			setEditError('Failed to save placement');
		}
		setEditSubmitting(false);
		setEditAction(null);
	};

	const handleEditDelete = async () => {
		if (!editId) return;
		if (!confirm('Are you sure you want to delete this placement?')) return;
		setEditSubmitting(true);
		setEditAction('delete');
		setEditError('');
		try {
			const res = await fetch(`/api/placements/${editId}`, { method: 'DELETE' });
			if (res.ok) {
				handleEditClose();
				fetchData();
			} else {
				setEditError('Failed to delete placement');
			}
		} catch (err) {
			setEditError('Error deleting placement');
		}
		setEditSubmitting(false);
		setEditAction(null);
	};

	const subjectOptions = ['Mathematics', 'Science', 'English', 'Computer'];

	return (
	   <div className="space-y-3">
		   <div className="flex justify-between items-center mb-2">
			   <h2 className="text-xl font-bold">Placements</h2>
			   <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
			   	   + Create Placement
			   </Button>
		   </div>

		   {/* Filters */}
		   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-1.5">
			   <div className="flex-1 flex items-center sm:justify-start justify-center">
			   	   {/* Future: Add manager filter dropdown here if needed */}
			   </div>
			   <div className="flex-1 flex justify-center">
			   	   <div className="bg-white/80 border border-blue-100 rounded-xl shadow-sm px-3 py-2 flex flex-row flex-wrap md:flex-nowrap items-center gap-2 w-full">
			   		   <div className="flex items-center gap-2 w-full sm:flex-1">
			   		   	   <label className="font-semibold text-blue-700">Name</label>
			   		   	   <input
			   		   	   	type="text"
			   		   	   	className="border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition w-full min-w-[160px]"
			   		   	   	placeholder="Search by name"
			   		   	   	value={nameFilter}
			   		   	   	onChange={e => setNameFilter(e.target.value)}
			   		   	   />
			   		   </div>
			   	   </div>
			   </div>
		   </div>

		   {/* Placements Card Listing */}
		   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
			   {filteredPlacements.length === 0 && (
			   	   <div className="col-span-full text-center py-4 text-gray-400">No placements found.</div>
			   )}
			   {filteredPlacements.map((p) => (
			   	   <Card key={p.id} className="p-3 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
			   		   <div>
			   		   	   <h3 className="font-bold">{p.name}</h3>
			   		   	   <p className="text-sm text-gray-600">{p.school?.name || ''} • {p.manager ? `${p.manager.firstName} ${p.manager.lastName}` : ''}</p>
			   		   	   <div className="flex flex-wrap gap-1 mt-1">
			   		   	   	   {p.subjects && p.subjects.length > 0 ? (
			   		   	   	   	   p.subjects.map(subj => (
			   		   	   	   	   	   <span key={subj} className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold">{subj}</span>
			   		   	   	   	   ))
			   		   	   	   ) : <span className="text-xs text-gray-400">No subjects</span>}
			   		   	   </div>
			   		   	   <p className="text-xs text-gray-500 mt-1">Fellows: {p.fellowCount}</p>
			   		   </div>
			   		   <div className="flex gap-2">
						   <Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleEditOpen(p)} aria-label="Edit">
							   <Pencil className="w-4 h-4" />
						   </Button>
						   <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => setDeleteId(p.id)}>
							   <Trash2 className="w-4 h-4" />
						   </Button>
			   		   </div>
			   	   </Card>
			   ))}
		   </div>

			   {showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
					<div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
						<div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
							<button
								className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
								onClick={() => {
									setShowAddModal(false);
									setForm({ name: '', schoolId: '', managerId: '', fellowCount: 0, subjects: [] });
								}}
								aria-label="Close"
							>
								&times;
							</button>
							<h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Placement</h2>
							<form onSubmit={createPlacement} className="space-y-6">
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Placement Name *</label>
									<input
										type="text"
										className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
										placeholder="e.g., Kushmawati Placement 2022, Dang Group Placement 2019"
										value={form.name}
										onChange={e => setForm({ ...form, name: e.target.value })}
										required
									/>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">School *</label>
									<select
										className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
										value={form.schoolId}
										onChange={e => setForm({ ...form, schoolId: e.target.value })}
										required
									>
										<option value="">Select School</option>
										{schools.map((s) => (
											<option key={s.id} value={s.id}>{s.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Manager (Staff) *</label>
									<select
										className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
										value={form.managerId}
										onChange={e => setForm({ ...form, managerId: e.target.value })}
										required
									>
										<option value="">Select Manager</option>
										{staffMembers.map((s) => (
											<option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Subjects Taught *</label>
									<div className="grid grid-cols-2 gap-2">
										{subjectOptions.map((subject) => (
											<label key={subject} className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={form.subjects.includes(subject)}
													onChange={() => handleSubjectToggle(subject)}
													className="w-4 h-4"
												/>
												{subject}
											</label>
										))}
									</div>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Number of Fellows</label>
									<input
										type="number"
										min="0"
										className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
										value={form.fellowCount}
										onChange={e => setForm({ ...form, fellowCount: parseInt(e.target.value) || 0 })}
									/>
								</div>
								<div className="flex gap-4 mt-8">
									<button
										type="submit"
										className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
									>
										Create Placement
									</button>
									<button
										type="button"
										className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
										onClick={() => {
											setShowAddModal(false);
											setForm({ name: '', schoolId: '', managerId: '', fellowCount: 0, subjects: [] });
										}}
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
			{showEditModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
					<div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
						<div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
							<button
								className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
								onClick={handleEditClose}
								aria-label="Close"
							>
								&times;
							</button>
							<h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Placement</h2>
							<form onSubmit={handleEditSubmit} className="space-y-6">
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Placement Name *</label>
									<input
										type="text"
										className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
										placeholder="Edit placement name..."
										value={form.name}
										onChange={e => setForm({ ...form, name: e.target.value })}
										required
									/>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">School *</label>
									<select
										className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
										value={form.schoolId}
										onChange={e => setForm({ ...form, schoolId: e.target.value })}
										required
									>
										<option value="">Select School</option>
										{schools.map((s) => (
											<option key={s.id} value={s.id}>{s.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Manager (Staff) *</label>
									<select
										className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
										value={form.managerId}
										onChange={e => setForm({ ...form, managerId: e.target.value })}
										required
									>
										<option value="">Select Manager</option>
										{staffMembers.map((s) => (
											<option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Subjects Taught *</label>
									<div className="grid grid-cols-2 gap-2">
										{subjectOptions.map((subject) => (
											<label key={subject} className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={form.subjects.includes(subject)}
													onChange={() => handleSubjectToggle(subject)}
													className="w-4 h-4"
												/>
												{subject}
											</label>
										))}
									</div>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-blue-700">Number of Fellows</label>
									<input
										type="number"
										min="0"
										className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
										value={form.fellowCount}
										onChange={e => setForm({ ...form, fellowCount: parseInt(e.target.value) || 0 })}
									/>
								</div>
								{editError && (
									<div className="text-red-500 text-sm text-center font-semibold">
										{editError}
									</div>
								)}
								<div className="flex gap-4 mt-8">
									<button
										type="submit"
										className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
										disabled={editSubmitting || !form.name.trim()}
									>
										{editAction === 'save' && editSubmitting ? 'Saving...' : 'Save'}
									</button>
									<button
										type="button"
										className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
										onClick={handleEditDelete}
										disabled={editSubmitting}
									>
										{editAction === 'delete' && editSubmitting ? 'Deleting...' : 'Delete'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Confirm Delete Modal */}
			<ConfirmModal
				open={!!deleteId}
				title="Delete Placement"
				message="Are you sure you want to delete this placement? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDelete}
				onCancel={() => setDeleteId(null)}
				loading={deleteLoading}
			/>
		</div>
	);
	}

