"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { useSession } from "next-auth/react";

const JOB_TYPES = [
	{ value: "FULL_TIME", label: "Full Time" },
	{ value: "PART_TIME", label: "Part Time" },
	{ value: "CONTRACT", label: "Contract" },
	{ value: "INTERNSHIP", label: "Internship" },
	{ value: "VOLUNTEER", label: "Volunteer" },
	{ value: "FREELANCE", label: "Freelance" },
	{ value: "TEMPORARY", label: "Temporary" },
	{ value: "REMOTE", label: "Remote" },
	{ value: "HYBRID", label: "Hybrid" },
];

export default function NewJobPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [deadline, setDeadline] = useState("");
	const [jobType, setJobType] = useState("FULL_TIME");
	const [sector, setSector] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
	const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([]);

	useEffect(() => {
		fetch("/api/skills")
			.then((res) => res.json())
			.then((data) => setSkills(data));
	}, []);

	const handleSkillsChange = (selected: any) => {
		setSelectedSkills(selected || []);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/jobs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					description,
					location,
					deadline: deadline || null,
					jobType,
					sector,
					requiredSkills: selectedSkills.map(s => s.value),
					status: "OPEN",
					createdById: session?.user?.id,
				}),
			});
			if (res.ok) {
				router.push("/jobs");
			} else {
				const data = await res.json();
				setError(data.error || "Failed to create job posting");
			}
		} catch {
			setError("Failed to create job posting");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-4 mb-16 sm:mb-0 border-4 border-blue-400/70 bg-gradient-to-br from-blue-50 via-white to-blue-100">
			<h1 className="text-3xl font-extrabold mb-8 text-blue-700 text-center tracking-tight">
				Add New Job Posting
			</h1>
			<div className="mb-4 text-sm text-gray-700 text-center bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
				By posting a job, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-semibold">Terms and Conditions</a>.
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Title</label>
					<input
						type="text"
						className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">
						Description
					</label>
					<textarea
						className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
					/>
					<div className="mb-2 mt-2 text-xs font-normal text-gray-800 bg-gray-50 border border-blue-200 rounded-lg p-3 italic">
						<div>
							This editor supports <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Markdown syntax</a>.
						</div>
						<div className="mt-1">
							You can use online tools like <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Markdown Live Preview</a> or <a href="https://stackedit.io/app#" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">StackEdit</a> to compose and copy your content here.
							To convert a Word document to Markdown, try <a href="https://www.word2md.net/" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">word2md.net</a> and paste the result here.
						</div>
					</div>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Location</label>
					<input
						type="text"
						className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Deadline</label>
					<input
						type="date"
						className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none"
						value={deadline}
						onChange={(e) => setDeadline(e.target.value)}
					/>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Job Type</label>
					<select
						className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
						value={jobType}
						onChange={(e) => setJobType(e.target.value)}
						required
					>
						{JOB_TYPES.map((jt) => (
							<option key={jt.value} value={jt.value}>
								{jt.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Sector</label>
					<input
						type="text"
						className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none"
						value={sector}
						onChange={(e) => setSector(e.target.value)}
						placeholder="e.g. Education, Health, Technology"
					/>
				</div>
				<div>
					<label className="block font-semibold mb-2 text-blue-700">Required Skills</label>
					<Select
						instanceId="job-required-skills"
						isMulti
						isSearchable
						options={skills.map(skill => ({ value: skill.id, label: skill.name }))}
						value={selectedSkills}
						onChange={handleSkillsChange}
						classNamePrefix="react-select"
						placeholder="Select required skills..."
						styles={{
							control: (base) => ({
								...base,
								borderColor: "#60a5fa",
								boxShadow: "0 0 0 2px #bae6fd",
								borderRadius: "0.75rem",
								minHeight: "44px",
							}),
							multiValue: (base) => ({
								...base,
								backgroundColor: "#3b82f6",
								color: "white",
								borderRadius: "0.5rem",
							}),
							multiValueLabel: (base) => ({
								...base,
								color: "white",
								fontWeight: 600,
							}),
							multiValueRemove: (base) => ({
								...base,
								color: "#fff",
								':hover': { backgroundColor: '#2563eb', color: 'white' },
							}),
						}}
					/>
				</div>
				{error && (
					<div className="text-red-500 text-sm text-center font-semibold">
						{error}
					</div>
				)}
				<div className="flex gap-4 mt-8">
					<button
						type="submit"
						className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
						disabled={loading}
					>
						{loading ? "Adding..." : "Add"}
					</button>
					<button
						type="button"
						className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
						onClick={() => router.push("/jobs")}
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
