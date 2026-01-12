'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

	// Category filter
	const [categoryFilter, setCategoryFilter] = useState('');
	// Filtered skills
	const filteredSkills = useMemo(() => {
		if (!categoryFilter) return skills;
		return skills.filter((s) => Array.isArray(s.categories) && s.categories.includes(categoryFilter));
	}, [skills, categoryFilter]);

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
		}
	};

	// ...existing code...
	const startEdit = (s: Skill) => {
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
		if (!editState.id) return;
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

	const handleDelete = async (id: string) => {
		if (!window.confirm('Are you sure you want to delete this skill?')) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/skills/${id}`, {
				method: 'DELETE',
			});
			if (res.ok) {
				fetchData();
			} else {
				const errorData = await res.json();
				alert(errorData.error || 'Failed to delete skill');
			}
		} catch (error) {
			console.error('Failed to delete skill:', error);
		} finally {
			setLoading(false);
		}
	};

	// ...existing code...
	return (
		<div className="space-y-6">
			{/* Category filter */}
			<div className="flex items-center gap-2 mb-4">
				<label className="font-semibold text-blue-700">Category</label>
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
			{/* Skills */}
			<div>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">Skills</h2>
					<Button onClick={() => setShowSkillForm(!showSkillForm)} className="bg-blue-600 text-white hover:bg-blue-700">
						{showSkillForm ? 'Cancel' : '+ Add Skill'}
					</Button>
				</div>

				{showSkillForm && (
					<Card className="p-6 mb-4">
						<form onSubmit={createSkill} className="space-y-4">
							<input
								type="text"
								placeholder="Skill Name"
								value={skillForm.name}
								onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
								className="w-full px-3 py-2 border rounded"
								required
							/>
							<input
								type="text"
								placeholder="Description"
								value={skillForm.description}
								onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
								className="w-full px-3 py-2 border rounded"
							/>
							<Select<CategoryOption, true>
								isMulti
								options={categories as readonly CategoryOption[]}
								value={skillForm.categories}
								onChange={(selected) => setSkillForm({ ...skillForm, categories: Array.isArray(selected) ? [...selected] : [] })}
								classNamePrefix="react-select"
								placeholder="Select categories..."
							/>
							<Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create Skill</Button>
						</form>
					</Card>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					  {filteredSkills.map((s) => (
						<Card key={s.id} className="p-4 flex justify-between items-center border-2 border-blue-500/70 shadow-sm rounded-xl">
							{editState.id === s.id ? (
								<form onSubmit={saveEdit} className="flex-1 flex flex-col gap-2">
									<input
										type="text"
										value={editState.name}
										onChange={(e) => setEditState({ ...editState, name: e.target.value })}
										className="px-3 py-2 border rounded w-full"
										required
										disabled={loading}
									/>
									<input
										type="text"
										value={editState.description}
										onChange={(e) => setEditState({ ...editState, description: e.target.value })}
										className="px-3 py-2 border rounded w-full"
										placeholder="Description"
										disabled={loading}
									/>
									<Select<CategoryOption, true>
										isMulti
										options={categories as readonly CategoryOption[]}
										value={editState.categories}
										onChange={(selected) => setEditState({ ...editState, categories: Array.isArray(selected) ? [...selected] : [] })}
										classNamePrefix="react-select"
										placeholder="Select categories..."
										isDisabled={loading}
									/>
									<div className="flex gap-2 mt-2">
										<Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
										<Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
									</div>
								</form>
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
										<Button size="icon" variant="destructive" onClick={() => handleDelete(s.id)} aria-label="Delete">
											<Trash2 className="w-4 h-4" />
										</Button>
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
