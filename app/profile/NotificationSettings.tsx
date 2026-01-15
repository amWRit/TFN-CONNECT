"use client";
import { useState, useEffect } from "react";

const SUBSCRIPTION_TYPES = [
  { value: "EVENT", label: "Events" },
  { value: "JOB_POSTING", label: "Job Postings" },
  { value: "OPPORTUNITY", label: "Opportunities" },
  { value: "POST", label: "Posts" },
  { value: "PERSON", label: "People" },
  { value: "SCHOOL", label: "Schools" },
];

export default function NotificationSettings() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data.subscriptions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (type: string) => {
    setSubscriptions((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
      <p className="mb-4 text-gray-600">
        Select which types of notifications you want to receive by email. <br />
        <span className="text-sm text-gray-500">No subscriptions = no emails.</span>
      </p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-2 mb-6">
            {SUBSCRIPTION_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subscriptions.includes(type.value)}
                  onChange={() => handleChange(type.value)}
                  className="accent-blue-600"
                />
                {type.label}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
          {success && <div className="text-green-600 mt-2">Preferences updated!</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
