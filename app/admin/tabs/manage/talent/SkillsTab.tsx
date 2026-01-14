'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ConfirmModal';
import Select from 'react-select';
import { MultiValue } from 'react-select';
import { Pencil, Trash2, Group } from 'lucide-react';
import { useRef } from 'react';

type CategoryOption = { value: string; label: string };

interface EditState {
	id: string | null;
	name: string;
	categories: CategoryOption[];
	description: string;
}

interface Skill {
  id: string;
  name: string;
  categories: string[];
  description?: string;
}

export default function SkillsTab() {

	const [skills, setSkills] = useState<Skill[]>([]);
	const [categories, setCategories] = useState<CategoryOption[]>([]);
	const [showSkillForm, setShowSkillForm] = useState(false);
	const [skillForm, setSkillForm] = useState<{ name: string; categories: CategoryOption[]; description: string }>({ name: '', categories: [], description: '' });
	const [editState, setEditState] = useState<EditState>({ id: null, name: '', categories: [], description: '' });
	const [loading, setLoading] = useState(false);
	const [addLoading, setAddLoading] = useState(false);
	const [addError, setAddError] = useState('');
	const [editError, setEditError] = useState('');

	// Category filter
	const [categoryFilter, setCategoryFilter] = useState('');
	// Name filter
	const [nameFilter, setNameFilter] = useState('');

	// Filtered skills
	const filteredSkills = useMemo(() => {
		let filtered = skills;
		if (categoryFilter) {
			filtered = filtered.filter((s) => Array.isArray(s.categories) && s.categories.includes(categoryFilter));
		}
		if (nameFilter) {
			filtered = filtered.filter((s) => s.name.toLowerCase().includes(nameFilter.toLowerCase()));
		}
		return filtered;
	}, [skills, categoryFilter, nameFilter]);

	useEffect(() => {
		fetchData();
		fetchCategories();
	}, []);
	const fetchCategories = async () => {
		try {
			const res = await fetch('/api/skillcategories');
			if (res.ok) {
				const cats = await res.json();
				setCategories(cats.map((cat: { id: string; name: string }) => ({ value: cat.id, label: cat.name })));
			}
		} catch (error) {
			console.error('Failed to fetch categories:', error);
		}
	};

	const fetchData = async () => {
		try {
			const sRes = await fetch('/api/skills');
			if (sRes.ok) setSkills(await sRes.json());
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	};

	const createSkill = async (e: React.FormEvent) => {
		e.preventDefault();
		setAddError('');
		if (!skillForm.name.trim()) {
			setAddError('Skill name is required');
			return;
		}
		if (!skillForm.categories || skillForm.categories.length === 0) {
			setAddError('At least one category is required');
			return;
		}
		// Unique name check (case-insensitive)
		if (skills.some(s => s.name.trim().toLowerCase() === skillForm.name.trim().toLowerCase())) {
			setAddError('Skill name must be unique');
			return;
		}
		setAddLoading(true);
		try {
			const res = await fetch('/api/skills', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(skillForm),
			});
			if (res.ok) {
				setSkillForm({ name: '', categories: [], description: '' });
				setShowSkillForm(false);
				fetchData();
			}
		} catch (error) {
			console.error('Failed to create Skill:', error);
		} finally {
			setAddLoading(false);
		}
	};

	// ...existing code...
	const startEdit = (s: Skill) => {
		setEditError('');
		setEditState({
			id: s.id,
			name: s.name,
			categories: Array.isArray(s.categories)
				? s.categories.map((cat) => {
							const found = categories.find((c) => c.label === cat);
							return found ? found : { value: '', label: cat };
						})
				: [],
			description: s.description || '',
		});
	};

	const cancelEdit = () => {
		setEditState({ id: null, name: '', categories: [], description: '' });
	};

	const saveEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		setEditError('');
		if (!editState.id) return;
		if (!editState.name.trim()) {
			setEditError('Skill name is required');
			return;
		}
		if (!editState.categories || editState.categories.length === 0) {
			setEditError('At least one category is required');
			return;
		}
		// Unique name check (case-insensitive, exclude current skill)
		if (skills.some(s => s.id !== editState.id && s.name.trim().toLowerCase() === editState.name.trim().toLowerCase())) {
			setEditError('Skill name must be unique');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(`/api/skills/${editState.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editState.name,
					categories: editState.categories,
					description: editState.description,
				}),
			});
			if (res.ok) {
				cancelEdit();
				fetchData();
			} else {
				const errorData = await res.json();
				alert(errorData.error || 'Failed to update skill');
			}
		} catch (error) {
			console.error('Failed to update skill:', error);
		} finally {
			setLoading(false);
		}
	};

	// ConfirmModal state for delete
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const handleDelete = async () => {
		if (!deleteId) return;
		setDeleteLoading(true);
		try {
			const res = await fetch(`/api/skills/${deleteId}`, {
				method: 'DELETE',
			});
			if (res.ok) {
				setDeleteId(null);
				fetchData();
			} else {
				const errorData = await res.json();
				alert(errorData.error || 'Failed to delete skill');
			}
		} catch (error) {
			console.error('Failed to delete skill:', error);
		} finally {
			setDeleteLoading(false);
		}
	};

	// ...existing code...
	return (
		<div className="space-y-3">
				{/* Filters */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 bg-slate-50/95 border-b border-slate-200/60 py-1.5">
					<div className="flex-1 flex items-center sm:justify-start justify-center">
						<div className="flex items-center gap-4">
							<div className="relative flex items-center">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
									<Group size={18} />
								</span>
								<select
									className="appearance-none pl-9 pr-12 py-2 w-52 border-2 border-blue-400 rounded-full bg-blue-100/80 font-semibold text-blue-800 focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-base"
									value={categoryFilter}
									onChange={e => setCategoryFilter(e.target.value)}
								>
									<option value="">All Categories</option>
									{categories.map((cat) => (
										<option key={cat.value} value={cat.label}>{cat.label}</option>
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
			{/* Skills */}
			<div>
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-bold">Skills</h2>
					  <Button onClick={() => { setAddError(''); setShowSkillForm(!showSkillForm); }} className="bg-blue-600 text-white hover:bg-blue-700">
						{showSkillForm ? 'Cancel' : '+ Add Skill'}
					</Button>
				</div>

				{showSkillForm && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
						<div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
							  <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[98vh] overflow-y-auto">
								<button
									className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
									onClick={() => {
										setShowSkillForm(false);
										setSkillForm({ name: '', categories: [], description: '' });
									}}
									aria-label="Close"
								>
									&times;
								</button>
								<h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Add Skill</h2>
								<form onSubmit={createSkill} className="space-y-6">
									{addError && (
										<div className="text-red-500 text-center font-semibold mb-2">{addError}</div>
									)}
									<div>
										<label className="block font-semibold mb-2 text-blue-700">Skill Name *</label>
										<input
											type="text"
											className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
											placeholder="Skill Name"
											value={skillForm.name}
											onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
											required
										/>
									</div>
									<div>
										<label className="block font-semibold mb-2 text-blue-700">Description</label>
										<input
											type="text"
											className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
											placeholder="Description"
											value={skillForm.description}
											onChange={e => setSkillForm({ ...skillForm, description: e.target.value })}
										/>
									</div>
									<div>
										<label className="block font-semibold mb-2 text-blue-700">Categories *</label>
										<div className="text-xs text-blue-500 mb-1">You can select multiple categories</div>
										<Select<CategoryOption, true>
											isMulti
											options={categories as readonly CategoryOption[]}
											value={skillForm.categories}
											onChange={(selected) => setSkillForm({ ...skillForm, categories: Array.isArray(selected) ? [...selected] : [] })}
											classNamePrefix="react-select"
											placeholder="Select categories..."
										/>
									</div>
									<div className="flex gap-4 mt-8">
										<button
											type="submit"
											className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
											disabled={addLoading}
										>
											{addLoading ? 'Creating...' : 'Create Skill'}
										</button>
										<button
											type="button"
											className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
											onClick={() => {
												setShowSkillForm(false);
												setSkillForm({ name: '', categories: [], description: '' });
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
					  {filteredSkills.map((s) => (
						<Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
							{editState.id === s.id ? (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
									<div className="relative w-full max-w-xl sm:max-w-2xl mx-2">
										<div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 border-4 border-blue-400/70 max-h-[90vh] overflow-y-auto">
											<button
												className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
												onClick={cancelEdit}
												aria-label="Close"
											>
												&times;
											</button>
											<h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Skill</h2>
												<form onSubmit={saveEdit} className="space-y-6">
													{editError && (
														<div className="text-red-500 text-center font-semibold mb-2">{editError}</div>
													)}
												<div>
													<label className="block font-semibold mb-2 text-blue-700">Skill Name *</label>
													<input
														type="text"
														className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
														placeholder="Edit skill name..."
														value={editState.name}
														onChange={e => setEditState({ ...editState, name: e.target.value })}
														required
														disabled={loading}
													/>
												</div>
												<div>
													<label className="block font-semibold mb-2 text-blue-700">Description</label>
													<input
														type="text"
														className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
														placeholder="Edit description..."
														value={editState.description}
														onChange={e => setEditState({ ...editState, description: e.target.value })}
														disabled={loading}
													/>
												</div>
												<div>
													<label className="block font-semibold mb-2 text-blue-700">Categories *</label>
													<div className="text-xs text-blue-500 mb-1">You can select multiple categories</div>
													<Select<CategoryOption, true>
														isMulti
														options={categories as readonly CategoryOption[]}
														value={editState.categories}
														onChange={(selected) => setEditState({ ...editState, categories: Array.isArray(selected) ? [...selected] : [] })}
														classNamePrefix="react-select"
														placeholder="Select categories..."
														isDisabled={loading}
													/>
												</div>
												<div className="flex gap-4 mt-8">
													<button
														type="submit"
														className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
														disabled={loading}
													>
														{loading ? 'Saving...' : 'Save'}
													</button>
													<button
														type="button"
														className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
														onClick={cancelEdit}
														disabled={loading}
													>
														Cancel
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							) : (
								<>
									<div>
										<h3 className="font-bold mb-1">{s.name}</h3>
										<div className="mb-1 flex flex-wrap gap-1 items-center">
											<span className="text-xs text-gray-600">Category:</span>
											{Array.isArray(s.categories) && s.categories.length > 0
												? s.categories.map((cat, idx) => (
														<span key={idx} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
															{cat}
														</span>
													))
												: <span className="text-xs text-gray-400">---</span>}
										</div>
										<div className="mt-1">
											  <span className="text-xs text-gray-600">Description: </span>
											<span className="text-xs text-gray-700">{s.description ? s.description : '---'}</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Button size="icon" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => startEdit(s)} aria-label="Edit">
											<Pencil className="w-4 h-4" />
										</Button>
										<Button size="icon" variant="destructive" onClick={() => setDeleteId(s.id)} aria-label="Delete">
											<Trash2 className="w-4 h-4" />
										</Button>
										{/* Confirm Delete Modal */}
										<ConfirmModal
											open={!!deleteId}
											title="Delete Skill"
											message="Are you sure you want to delete this skill? This action cannot be undone."
											confirmText="Delete"
											cancelText="Cancel"
											onConfirm={handleDelete}
											onCancel={() => setDeleteId(null)}
											loading={deleteLoading}
										/>
									</div>
								</>
							)}
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
function useMemo<T>(factory: () => T, deps: any[]): T {
	const prevDepsRef = useRef<any[]>();
	const valueRef = useRef<T>();

	const depsChanged =
		!prevDepsRef.current ||
		prevDepsRef.current.length !== deps.length ||
		prevDepsRef.current.some((dep, i) => dep !== deps[i]);

	if (depsChanged) {
		valueRef.current = factory();
		prevDepsRef.current = deps;
	}

	return valueRef.current as T;
}
