"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Pencil, Trash2 } from 'lucide-react';
import { User as UserIcon } from 'lucide-react';

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
	// Fetch person types
	useEffect(() => {
		fetch('/api/meta/person-types')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data.types)) setPersonTypes(data.types);
			});
	}, []);
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

	const [showForm, setShowForm] = useState(false);
	const [formStep, setFormStep] = useState(1); // 1: basic, 2: education/experience, 3: fellowship

	const [basicForm, setBasicForm] = useState({
		firstName: '',
		middleName: '',
		lastName: '',
		email1: '',
		dob: '',
		phone1: '',
		type: 'ALUMNI',
	});

	const [educations, setEducations] = useState([{ institution: '', level: '', name: '', start: '', end: '' }]);
	const [experiences, setExperiences] = useState([{ orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
	const [fellowship, setFellowship] = useState({ cohortId: '', placementId: '', subjects: [] as string[] });

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

	const handleAddEducation = () => {
		setEducations([...educations, { institution: '', level: '', name: '', start: '', end: '' }]);
	};

	const handleAddExperience = () => {
		setExperiences([...experiences, { orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formStep === 1) {
			if (!basicForm.firstName || !basicForm.lastName || !basicForm.email1) {
				alert('Please fill required fields');
				return;
			}
			setFormStep(2);
			return;
		}

		if (formStep === 2) {
			if (basicForm.type === 'ALUMNI') {
				setFormStep(3);
			} else {
				submitPerson();
			}
			return;
		}

		if (formStep === 3) {
			submitPerson();
		}
	};

	const submitPerson = async () => {
		try {
			let personId;
			let method = 'POST';
			let url = '/api/people';
			if (editingPerson) {
				method = 'PUT';
				url = `/api/people/${editingPerson.id}`;
				personId = editingPerson.id;
			}
			const personRes = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...basicForm,
					dob: basicForm.dob ? new Date(basicForm.dob) : null,
				}),
			});

			if (!personRes.ok) {
				alert(`Failed to ${editingPerson ? 'update' : 'create'} person`);
				return;
			}

			const person = await personRes.json();
			personId = person.id;

			// Create or update educations and experiences as needed (not implemented here for edit)

			// Create fellowship if alumni (not implemented here for edit)

			// Reset form
			setBasicForm({ firstName: '', middleName: '', lastName: '', email1: '', dob: '', phone1: '', type: 'ALUMNI' });
			setEducations([{ institution: '', level: '', name: '', start: '', end: '' }]);
			setExperiences([{ orgName: '', title: '', sector: '', type: 'full_time', start: '', end: '' }]);
			setFellowship({ cohortId: '', placementId: '', subjects: [] });
			setFormStep(1);
			setShowForm(false);
			setEditingPerson(null);
			fetchData();
		} catch (error) {
			console.error('Failed to submit person:', error);
			alert(`Error ${editingPerson ? 'updating' : 'creating'} person`);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">People</h2>
				<Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white hover:bg-blue-700">
					{showForm ? 'Cancel' : '+ Add Person'}
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

			{showForm && (
				<Card className="p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Step 1: Basic Info */}
						{formStep === 1 && (
							<>
								<h3 className="font-bold">Basic Information</h3>
								<div className="grid grid-cols-3 gap-4">
									<input
										type="text"
										placeholder="First Name *"
										value={basicForm.firstName}
										onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })}
										className="px-3 py-2 border rounded"
										required
									/>
									<input
										type="text"
										placeholder="Middle Name"
										value={basicForm.middleName}
										onChange={(e) => setBasicForm({ ...basicForm, middleName: e.target.value })}
										className="px-3 py-2 border rounded"
									/>
									<input
										type="text"
										placeholder="Last Name *"
										value={basicForm.lastName}
										onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })}
										className="px-3 py-2 border rounded"
										required
									/>
								</div>
								<input
									type="email"
									placeholder="Email *"
									value={basicForm.email1}
									onChange={(e) => setBasicForm({ ...basicForm, email1: e.target.value })}
									className="w-full px-3 py-2 border rounded"
									required
								/>
								<div className="grid grid-cols-2 gap-4">
									<input
										type="date"
										placeholder="Date of Birth"
										value={basicForm.dob}
										onChange={(e) => setBasicForm({ ...basicForm, dob: e.target.value })}
										className="px-3 py-2 border rounded"
									/>
									<input
										type="tel"
										placeholder="Phone"
										value={basicForm.phone1}
										onChange={(e) => setBasicForm({ ...basicForm, phone1: e.target.value })}
										className="px-3 py-2 border rounded"
									/>
								</div>
								<select
									value={basicForm.type}
									onChange={(e) => setBasicForm({ ...basicForm, type: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								>
									<option value="ALUMNI">Alumni</option>
									<option value="STAFF">Staff</option>
									<option value="ADMIN">Admin</option>
								</select>
							</>
						)}

						{/* Step 2: Education & Experience */}
						{formStep === 2 && (
							<>
								<h3 className="font-bold">Education & Experience</h3>
                
								<div>
									<h4 className="font-medium text-sm mb-2">Education</h4>
									{educations.map((edu, idx) => (
										<div key={idx} className="space-y-2 mb-4 p-3 bg-gray-50 rounded">
											<input
												type="text"
												placeholder="Institution"
												value={edu.institution}
												onChange={(e) => {
													const newEdu = [...educations];
													newEdu[idx].institution = e.target.value;
													setEducations(newEdu);
												}}
												className="w-full px-2 py-1 border rounded text-sm"
											/>
											<div className="grid grid-cols-3 gap-2">
												<input
													type="text"
													placeholder="Level"
													value={edu.level}
													onChange={(e) => {
														const newEdu = [...educations];
														newEdu[idx].level = e.target.value;
														setEducations(newEdu);
													}}
													className="px-2 py-1 border rounded text-sm"
												/>
												<input
													type="text"
													placeholder="Program Name"
													value={edu.name}
													onChange={(e) => {
														const newEdu = [...educations];
														newEdu[idx].name = e.target.value;
														setEducations(newEdu);
													}}
													className="px-2 py-1 border rounded text-sm"
												/>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<input type="date" value={edu.start} onChange={(e) => {
													const newEdu = [...educations];
													newEdu[idx].start = e.target.value;
													setEducations(newEdu);
												}} className="px-2 py-1 border rounded text-sm" />
												<input type="date" value={edu.end} onChange={(e) => {
													const newEdu = [...educations];
													newEdu[idx].end = e.target.value;
													setEducations(newEdu);
												}} className="px-2 py-1 border rounded text-sm" />
											</div>
										</div>
									))}
									<Button type="button" onClick={handleAddEducation} className="text-sm bg-blue-600 text-white hover:bg-blue-700">
										+ Add Education
									</Button>
								</div>

								<div>
									<h4 className="font-medium text-sm mb-2">Experience</h4>
									{experiences.map((exp, idx) => (
										<div key={idx} className="space-y-2 mb-4 p-3 bg-gray-50 rounded">
											<input
												type="text"
												placeholder="Organization"
												value={exp.orgName}
												onChange={(e) => {
													const newExp = [...experiences];
													newExp[idx].orgName = e.target.value;
													setExperiences(newExp);
												}}
												className="w-full px-2 py-1 border rounded text-sm"
											/>
											<div className="grid grid-cols-2 gap-2">
												<input
													type="text"
													placeholder="Job Title"
													value={exp.title}
													onChange={(e) => {
														const newExp = [...experiences];
														newExp[idx].title = e.target.value;
														setExperiences(newExp);
													}}
													className="px-2 py-1 border rounded text-sm"
												/>
												<input
													type="text"
													placeholder="Sector"
													value={exp.sector}
													onChange={(e) => {
														const newExp = [...experiences];
														newExp[idx].sector = e.target.value;
														setExperiences(newExp);
													}}
													className="px-2 py-1 border rounded text-sm"
												/>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<input type="date" value={exp.start} onChange={(e) => {
													const newExp = [...experiences];
													newExp[idx].start = e.target.value;
													setExperiences(newExp);
												}} className="px-2 py-1 border rounded text-sm" />
												<input type="date" value={exp.end} onChange={(e) => {
													const newExp = [...experiences];
													newExp[idx].end = e.target.value;
													setExperiences(newExp);
												}} className="px-2 py-1 border rounded text-sm" />
											</div>
										</div>
									))}
									<Button type="button" onClick={handleAddExperience} className="text-sm bg-blue-600 text-white hover:bg-blue-700">
										+ Add Experience
									</Button>
								</div>
							</>
						)}

						{/* Step 3: Fellowship (Alumni only) */}
						{formStep === 3 && basicForm.type === 'ALUMNI' && (
							<>
								<h3 className="font-bold">Fellowship Information</h3>
								<select
									value={fellowship.cohortId}
									onChange={(e) => setFellowship({ ...fellowship, cohortId: e.target.value })}
									className="w-full px-3 py-2 border rounded"
									required
								>
									<option value="">Select Cohort</option>
									{cohorts.map((c) => (
										<option key={c.id} value={c.id}>{c.name}</option>
									))}
								</select>
								<select
									value={fellowship.placementId}
									onChange={(e) => setFellowship({ ...fellowship, placementId: e.target.value })}
									className="w-full px-3 py-2 border rounded"
									required
								>
									<option value="">Select Placement</option>
									{placements.map((p) => (
										<option key={p.id} value={p.id}>{p.name || `Placement ${p.id}`}</option>
									))}
								</select>
							</>
						)}

						<div className="flex gap-2">
							{formStep > 1 && (
								<Button type="button" onClick={() => setFormStep(formStep - 1)} variant="outline">
									Back
								</Button>
							)}
							<Button type="submit" className="flex-1">
								{formStep < 3 ? 'Next' : 'Create Person'}
							</Button>
						</div>
					</form>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-3 mb-4">
				{filteredPeople.slice(0, 10).map((p) => (
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
										<UserIcon className="w-4 h-4" />
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
		</div>
	);
}