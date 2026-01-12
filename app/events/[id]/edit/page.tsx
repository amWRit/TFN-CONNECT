"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "NETWORKING", label: "Networking" },
  { value: "TRAINING", label: "Training" },
  { value: "REUNION", label: "Reunion" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "HACKATHON", label: "Hackathon" },
  { value: "SOCIAL", label: "Social" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "GENERAL", label: "General" },
  { value: "OTHER", label: "Other" },
];

const EVENT_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

interface Event {
  id: string;
  title: string;
  slug: string;
  overview?: string;
  description?: string;
  location?: string;
  address?: string;
  externalLink?: string;
  tags?: string[];
  sponsors?: string[];
  startDateTime: string;
  endDateTime?: string;
  type: string;
  status: string;
  capacity?: number;
  isFree: boolean;
  price?: number;
  organizerName?: string;
  organizerLink?: string;
}

function formatDateTimeLocal(dateString: string | undefined | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [overview, setOverview] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [tags, setTags] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [type, setType] = useState("GENERAL");
  const [status, setStatus] = useState("DRAFT");
  const [capacity, setCapacity] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerLink, setOrganizerLink] = useState("");

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data: Event) => {
        setTitle(data.title);
        setSlug(data.slug);
        setOverview(data.overview || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setAddress(data.address || "");
        setExternalLink(data.externalLink || "");
        setTags(data.tags?.join(", ") || "");
        setSponsors(data.sponsors?.join(", ") || "");
        setStartDateTime(formatDateTimeLocal(data.startDateTime));
        setEndDateTime(formatDateTimeLocal(data.endDateTime));
        setType(data.type || "GENERAL");
        setStatus(data.status || "DRAFT");
        setCapacity(data.capacity?.toString() || "");
        setIsFree(data.isFree ?? true);
        setPrice(data.price?.toString() || "");
        setOrganizerName(data.organizerName || "");
        setOrganizerLink(data.organizerLink || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load event");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setTagError(null);

    const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    if (tagList.length > 3) {
      setTagError("You can add up to 3 tags only.");
      setSaving(false);
      return;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
          headers['x-local-admin'] = 'true';
        }
      } catch (e) {}

      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title,
          slug,
          overview,
          description,
          location,
          address,
          externalLink: externalLink || null,
          tags: tagList,
          sponsors: sponsors ? sponsors.split(",").map((s) => s.trim()).filter(Boolean) : [],
          startDateTime,
          endDateTime: endDateTime || null,
          type,
          status,
          capacity: capacity ? parseInt(capacity, 10) : null,
          isFree,
          price: !isFree && price ? parseFloat(price) : null,
          organizerName: organizerName || null,
          organizerLink: organizerLink || null,
        }),
      });

      if (res.ok) {
        router.push(`/events/${id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update event");
      }
    } catch {
      setError("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/events");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete event");
      }
    } catch {
      setError("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12">
        <div className="text-center text-gray-500">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-12 mb-12 border-4 border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-emerald-700 tracking-tight">Edit Event</h1>
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg border border-red-700 shadow disabled:opacity-60 transition-all"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Title *</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Slug *</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
        </div>

        {/* Overview */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Overview</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Brief summary of the event"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Description</label>
          <textarea
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the event..."
          />
          <div className="text-xs text-gray-500 mt-1 italic">
            Tip: You can use Markdown to format your description.<br />
            Supports **bold**, _italics_, headings, ordered and unordered lists.<br />
            Try <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a> or the <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Guide</a> for syntax and examples.
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Event Type</label>
          <select
            className="w-full border-2 border-emerald-400 focus:border-emerald-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none font-semibold text-emerald-700"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Status</label>
          <select
            className="w-full border-2 border-emerald-400 focus:border-emerald-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none font-semibold text-emerald-700"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {EVENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Start Date & Time *</label>
            <input
              type="datetime-local"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">End Date & Time</label>
            <input
              type="datetime-local"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
            />
          </div>
        </div>

        {/* Location & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Location</label>
            <input
              type="text"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kathmandu or Virtual"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Address</label>
            <input
              type="text"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address (optional)"
            />
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Capacity</label>
            <input
              type="number"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Max attendees"
              min="1"
            />
          </div>
          <div className="flex items-center gap-3 pt-8">
            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-emerald-700">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="accent-emerald-600 w-5 h-5"
              />
              Free Event
            </label>
          </div>
          {!isFree && (
            <div>
              <label className="block font-semibold mb-2 text-emerald-700">Price (Rs.)</label>
              <input
                type="number"
                className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>

        {/* External Link */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Registration / External Link</label>
          <input
            type="url"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://zoom.us/... or registration link"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Tags <span className="text-xs text-gray-500">(max 3)</span></label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={tags}
            onChange={(e) => {
              setTags(e.target.value);
              setTagError(null);
            }}
            placeholder="leadership, education, youth (comma-separated)"
          />
          {tagError && (
            <div className="text-red-500 text-xs mt-1 font-semibold">{tagError}</div>
          )}
        </div>

        {/* Sponsors */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Sponsors</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={sponsors}
            onChange={(e) => setSponsors(e.target.value)}
            placeholder="Sponsor 1, Sponsor 2 (comma-separated)"
          />
        </div>

        {/* Organizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Organizer Name</label>
            <input
              type="text"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="Organization or person name"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-emerald-700">Organizer Link</label>
            <input
              type="url"
              className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
              value={organizerLink}
              onChange={(e) => setOrganizerLink(e.target.value)}
              placeholder="https://organizer-website.com"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm text-center font-semibold">{error}</div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="flex-1 bg-red-100 border-2 border-red-300 text-red-700 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-200 hover:border-red-400"
            onClick={() => router.push(`/events/${id}`)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
