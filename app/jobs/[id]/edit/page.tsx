"use client";

import { useEffect, useState, use } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  overview?: string;
  description: string;
  location?: string;
  jobType?: string;
  status?: string;
  requiredSkills?: string[];
  deadline?: string;
}

const jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FELLOWSHIP"];
const statusOptions = ["OPEN", "CLOSED"];

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    overview: "",
    description: "",
    location: "",
    jobType: "FULL_TIME",
    status: "OPEN",
    requiredSkills: [] as string[],
    deadline: "",
  });
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setForm({
          title: data.title || "",
          overview: data.overview || "",
          description: data.description || "",
          location: data.location || "",
          jobType: data.jobType || "FULL_TIME",
          status: data.status || "OPEN",
          requiredSkills: data.requiredSkills || [],
          deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0, 10) : "",
        });
        // Map skill IDs to skill names for react-select
        fetch("/api/skills")
          .then((res) => res.json())
          .then((skillsData) => {
            setSkills(skillsData);
            setSelectedSkills(
              (data.requiredSkills || []).map((id: string) => {
                const skill = skillsData.find((s: { id: string }) => s.id === id);
                return skill ? { value: skill.id, label: skill.name } : { value: id, label: id };
              })
            );
          });
        setLoading(false);
      });
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "select-multiple") {
      const options = (e.target as HTMLSelectElement).options;
      const values = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm(f => ({ ...f, [name]: values }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  const handleSkillsChange = (selected: any) => {
    setSelectedSkills(selected || []);
    setForm(f => ({ ...f, requiredSkills: (selected || []).map((s: any) => s.value) }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/jobs/${id}` , {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (res.ok) {
      router.push(`/jobs/${id}`);
    } else {
      alert("Failed to update job");
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading...</div>;

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      router.push("/jobs");
    } else {
      alert("Failed to delete job");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Edit Job</h1>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg border border-red-700 shadow disabled:opacity-60"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border-2 border-blue-400">
        {/* ...existing code... */}
        <label className="font-semibold">Title
          <input name="title" value={form.title} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500" required />
        </label>
        <label className="font-semibold">Overview
          <textarea name="overview" value={form.overview} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500" rows={2} />
        </label>
        <label className="font-semibold">Description
          <textarea name="description" value={form.description} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500" rows={4} required />
          <div className="text-xs text-gray-500 mt-1 italic">
            Tip: You can use Markdown to format your description.<br />
            Supports **bold**, _italics_, headings, ordered and unordered lists.<br />
            Try <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a> or the <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Guide</a> for syntax and examples.
          </div>
        </label>
        {/* ...existing code... */}
        <label className="font-semibold">Job Type
          <select name="jobType" value={form.jobType} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500">
            {jobTypes.map(type => (
              <option key={type} value={type} className="font-normal">{type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </label>
        {/* ...existing code... */}
        <label className="font-semibold">Location
          <input name="location" value={form.location} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500" />
        </label>
        <label className="font-semibold">Deadline
          <input type="date" name="deadline" value={form.deadline || ''} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500" />
        </label>
        <label className="font-semibold">Status
          <select name="status" value={form.status} onChange={handleChange} className="block w-full border-2 border-blue-400 rounded px-3 py-2 mt-1 font-normal focus:border-blue-600 focus:ring-blue-500">
            {statusOptions.map(status => (
              <option key={status} value={status} className="font-normal">{status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        {/* ...existing code... */}
        <label className="font-semibold">Required Skills
          <Select
            instanceId="edit-job-required-skills"
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
        </label>
        <div className="flex gap-4 mt-8">
          <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" className="flex-1 bg-red-100 border-2 border-red-300 text-red-700 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-200 hover:border-red-400" onClick={() => router.push(`/jobs/${id}`)} disabled={saving}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
