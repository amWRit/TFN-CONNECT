"use client";

import React, { useState } from "react";
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
}

export default function NewEventPage() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTagError(null);

    const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    if (tagList.length > 3) {
      setTagError("You can add up to 3 tags only.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
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
        setSuccess(true);
        router.push("/events");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event");
      }
    } catch {
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-4 mb-16 sm:mb-0 border-4 border-emerald-400/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">{/* Add bottom margin for mobile to avoid navbar overlap */}
      <h1 className="text-3xl font-extrabold mb-8 text-emerald-700 text-center tracking-tight">
        Add New Event
      </h1>
      <div className="mb-4 text-sm text-gray-700 text-center bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
        By posting an event, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700 font-semibold">Terms and Conditions</a>.
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-2 text-emerald-700">Title *</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 focus:border-emerald-500 rounded-lg px-4 py-2 bg-white/80 focus:bg-emerald-50 transition-all duration-200 outline-none"
            value={title}
            onChange={handleTitleChange}
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
            placeholder="auto-generated-from-title"
          />
          <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (auto-generated from title)</p>
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

        {/* Error / Success */}
        {error && (
          <div className="text-red-500 text-sm text-center font-semibold">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center font-semibold">Event created!</div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
          <button
            type="button"
            className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
            onClick={() => router.push("/events")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
