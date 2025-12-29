'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface EditState {
	id: string | null;
	name: string;
	category: string;
	description: string;
}

interface Skill {
	id: string;
	name: string;
	category: string;
	description?: string;
}

export default function SkillsTab() {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
	const [showSkillForm, setShowSkillForm] = useState(false);
	const [skillForm, setSkillForm] = useState({ name: '', category: '', description: '' });
	const [editState, setEditState] = useState<EditState>({ id: null, name: '', category: '', description: '' });
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchData();
		fetchCategories();
	}, []);
	const fetchCategories = async () => {
		try {
			const res = await fetch('/api/skillcategories');
			if (res.ok) setCategories(await res.json());
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
				setSkillForm({ name: '', category: 'teaching' });
				setShowSkillForm(false);
				fetchData();
			}
		} catch (error) {
			console.error('Failed to create Skill:', error);
		}
	};

	// ...existing code...
	const startEdit = (s: Skill) => {
	  setEditState({ id: s.id, name: s.name, category: s.category, description: s.description || '' });
	};

	const cancelEdit = () => {
	  setEditState({ id: null, name: '', category: 'teaching', description: '' });
	};

	const saveEdit = async (e: React.FormEvent) => {
	  e.preventDefault();
	  if (!editState.id) return;
	  setLoading(true);
	  try {
	    const res = await fetch(`/api/skills/${editState.id}`, {
	      method: 'PUT',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({ name: editState.name, category: editState.category, description: editState.description }),
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
							<select
								value={skillForm.category}
								onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
								className="w-full px-3 py-2 border rounded"
								required
							>
								<option value="">Select Category</option>
								{categories.map((cat) => (
									<option key={cat.id} value={cat.name}>{cat.name}</option>
								))}
							</select>
							<Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">Create Skill</Button>
						</form>
					</Card>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{skills.map((s) => (
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
									<select
										value={editState.category}
										onChange={(e) => setEditState({ ...editState, category: e.target.value })}
										className="px-3 py-2 border rounded"
										disabled={loading}
										required
									>
										<option value="">Select Category</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.name}>{cat.name}</option>
										))}
									</select>
									<div className="flex gap-2 mt-2">
										<Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>Save</Button>
										<Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={cancelEdit} disabled={loading}>Cancel</Button>
									</div>
								</form>
							) : (
								<>
									<div>
										<h3 className="font-bold">{s.name}</h3>
										<p className="text-xs text-gray-500 capitalize">{s.category}</p>
										{s.description && (
											<p className="text-xs text-gray-700 mt-1">{s.description}</p>
										)}
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