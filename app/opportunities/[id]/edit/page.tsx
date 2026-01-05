"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Opportunity {
  id: string;
  title: string;
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
    description: "",
    types: [] as string[],
    location: "",
    status: "OPEN"
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOpportunity(data);
        setForm({
          title: data.title || "",
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Edit Opportunity</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border-2 border-purple-400">
        <label className="font-semibold">Title
          <input name="title" value={form.title} onChange={handleChange} className="block w-full border rounded px-3 py-2 mt-1 font-normal" required />
        </label>
        <label className="font-semibold">Description
          <textarea name="description" value={form.description} onChange={handleChange} className="block w-full border rounded px-3 py-2 mt-1 font-normal" rows={4} required />
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
          <input name="location" value={form.location} onChange={handleChange} className="block w-full border rounded px-3 py-2 mt-1 font-normal" />
        </label>
        <label className="font-semibold">Status
          <select name="status" value={form.status} onChange={handleChange} className="block w-full border rounded px-3 py-2 mt-1 font-normal">
            {statusOptions.map(status => (
              <option key={status} value={status} className="font-normal">{status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-row-reverse gap-3 mt-6">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg min-w-[100px]" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-6 py-2 rounded-lg border border-red-300 min-w-[100px]" onClick={() => router.push(`/opportunities/${id}`)} disabled={saving}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
