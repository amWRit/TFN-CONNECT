"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
  overview?: string;
  description: string;
  types: string[];
  location?: string;
  status?: string;
}

const opportunityTypes = [
  "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
];

const statusOptions = ["OPEN", "CLOSED"];

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    overview: "",
    description: "",
    types: [] as string[],
    location: "",
    status: "OPEN"
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOpportunity(data);
        setForm({
          title: data.title || "",
          overview: data.overview || "",
          description: data.description || "",
          types: data.types || [],
          location: data.location || "",
          status: data.status || "OPEN"
        });
        setLoading(false);
      });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (res.ok) {
      router.push(`/opportunities/${id}`);
    } else {
      alert("Failed to update opportunity");
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto p-6">Loading...</div>;

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this opportunity? This action cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      router.push("/opportunities");
    } else {
      alert("Failed to delete opportunity");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-4 mb-16 sm:mb-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-purple-700">Edit Opportunity</h1>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg border border-red-700 shadow disabled:opacity-60"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-700 text-center bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
        By posting or editing an opportunity, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-purple-700 font-semibold">Terms and Conditions</a>.
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border-2 border-purple-400">
        <label className="font-semibold">Title
          <input name="title" value={form.title} onChange={handleChange} className="block w-full border-2 border-purple-400 rounded px-3 py-2 mt-1 font-normal focus:border-purple-600 focus:ring-purple-500" required />
        </label>
        <label className="font-semibold">Overview
          <input name="overview" value={form.overview} onChange={handleChange} className="block w-full border-2 border-purple-400 rounded px-3 py-2 mt-1 font-normal focus:border-purple-600 focus:ring-purple-500" required />
        </label>
        <label className="font-semibold">Description
          <textarea name="description" value={form.description} onChange={handleChange} className="block w-full border-2 border-purple-400 rounded px-3 py-2 mt-1 font-normal focus:border-purple-600 focus:ring-purple-500" rows={4} required />
          <div className="text-xs text-gray-500 mt-1 italic">
            Tip: You can use Markdown to format your description.<br />
            Supports **bold**, _italics_, headings, ordered and unordered lists.<br />
            Try <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a> or the <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Guide</a> for syntax and examples.
          </div>
        </label>
        <label className="font-semibold">Types
          <div className="flex flex-wrap gap-2 mt-1">
            {opportunityTypes.map((type) => (
              <label key={type} className={`px-2 py-1 rounded cursor-pointer border ${form.types.includes(type) ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={form.types.includes(type)}
                  onChange={() => {
                    setForm(f => ({
                      ...f,
                      types: f.types.includes(type)
                        ? f.types.filter(t => t !== type)
                        : [...f.types, type]
                    }));
                  }}
                />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        </label>
        <label className="font-semibold">Location
          <input name="location" value={form.location} onChange={handleChange} className="block w-full border-2 border-purple-400 rounded px-3 py-2 mt-1 font-normal focus:border-purple-600 focus:ring-purple-500" />
        </label>
        <label className="font-semibold">Status
          <select name="status" value={form.status} onChange={handleChange} className="block w-full border-2 border-purple-400 rounded px-3 py-2 mt-1 font-normal focus:border-purple-600 focus:ring-purple-500">
            {statusOptions.map(status => (
              <option key={status} value={status} className="font-normal">{status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-4 mt-8">
          <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" className="flex-1 bg-red-100 border-2 border-red-300 text-red-700 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-200 hover:border-red-400" onClick={() => router.push(`/opportunities/${id}`)} disabled={saving}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
