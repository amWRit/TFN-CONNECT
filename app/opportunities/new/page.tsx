"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const opportunityTypes = [
  "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [overview, setOverview] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTypeChange = (type: string) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, overview, description, types, location, status }),
      });
      if (res.ok) {
        setSuccess(true);
        router.push("/opportunities");
      } else {
        setError("Failed to create opportunity");
      }
    } catch {
      setError("Failed to create opportunity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-12 border-4 border-purple-400/70 bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <h1 className="text-3xl font-extrabold mb-8 text-purple-700 text-center tracking-tight">Add New Opportunity</h1>
      <div className="mb-4 text-sm text-gray-700 text-center bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
        By posting an opportunity, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-purple-700 font-semibold">Terms and Conditions</a>.
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Title</label>
          <input
            className="w-full border-2 border-purple-300 focus:border-purple-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-purple-50 transition-all duration-200 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Overview</label>
          <input
            className="w-full border-2 border-purple-300 focus:border-purple-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-purple-50 transition-all duration-200 outline-none"
            value={overview}
            onChange={e => setOverview(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Description</label>
          <textarea
            className="w-full border-2 border-purple-300 focus:border-purple-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-purple-50 transition-all duration-200 outline-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <div className="text-xs text-gray-500 mt-1 italic">
            Tip: You can use Markdown to format your description.<br />
            Supports **bold**, _italics_, headings, ordered and unordered lists.<br />
            Try <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a> or the <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Guide</a> for syntax and examples.
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Types</label>
          <div className="flex flex-wrap gap-2">
            {opportunityTypes.map((type) => (
              <label key={type} className={`px-3 py-1 rounded-lg cursor-pointer border-2 font-semibold transition-all duration-150 text-sm ${types.includes(type) ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-purple-400'}`}>
                <input
                  type="checkbox"
                  className="mr-1 accent-purple-600"
                  checked={types.includes(type)}
                  onChange={() => handleTypeChange(type)}
                />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Location</label>
          <input
            className="w-full border-2 border-purple-300 focus:border-purple-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-purple-50 transition-all duration-200 outline-none"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-purple-700">Status</label>
          <select
            className="w-full border-2 border-purple-400 focus:border-purple-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-purple-50 transition-all duration-200 outline-none font-semibold text-purple-700"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center font-semibold">Opportunity created!</div>}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Opportunity"}
          </button>
          <button
            type="button"
            className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
            onClick={() => router.push("/opportunities")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
