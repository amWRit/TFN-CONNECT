import { Bell, Mail, Briefcase, Users, Newspaper } from "lucide-react";
import React, { useState, useEffect } from "react";

const SUBSCRIPTION_TYPES = [
  { value: "EVENT", label: "Events", icon: <Bell className="text-blue-500" size={20} /> },
  { value: "JOB_POSTING", label: "Job Postings", icon: <Briefcase className="text-green-500" size={20} /> },
  { value: "OPPORTUNITY", label: "Opportunities", icon: <Users className="text-purple-500" size={20} /> },
  { value: "POST", label: "Posts", icon: <Newspaper className="text-orange-500" size={20} /> },
];

export default function SubscriptionSettings() {
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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [success]);

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-blue-600">
        <Mail className="text-blue-600" size={24} />
        Email Subscriptions
      </h2>
      <p className="mb-4 text-gray-600">
        Control what you get notified about.
      </p>
      <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded text-blue-800 flex items-center gap-2">
        <span>
          If you are <b>not subscribed</b>, you will still be notified about <b>important Job Postings, Opportunities, Posts, and Events</b> created by <b>admins</b>.
        </span>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {SUBSCRIPTION_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-center gap-3 bg-white rounded-lg shadow p-4 border hover:border-blue-400 transition cursor-pointer ${subscriptions.includes(type.value) ? 'ring-2 ring-blue-400' : ''}`}
              >
                {type.icon}
                <span className="font-semibold text-gray-800 text-lg flex-1">{type.label}</span>
                <input
                  type="checkbox"
                  checked={subscriptions.includes(type.value)}
                  onChange={() => handleChange(type.value)}
                  className="accent-blue-600 scale-125"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
          {success && <div className="text-green-600 mt-2">Preferences updated!</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
