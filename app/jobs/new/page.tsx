"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, jobType, requiredSkills }),
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
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow mt-12">
      <h1 className="text-2xl font-bold mb-6">Add New Job Posting</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Job Type</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={jobType} onChange={e => setJobType(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Required Skills (comma separated)</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold" disabled={loading}>
          {loading ? "Posting..." : "Add Job"}
        </button>
      </form>
    </div>
  );
}
