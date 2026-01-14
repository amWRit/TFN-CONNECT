"use client";

import { useState } from "react";
import JobsTab from "./JobsTab";
import OpportunitiesTab from "./OpportunitiesTab";
import EventsTab from "./EventsTab";

const TABS = [
  { key: "jobs", label: "Jobs" },
  { key: "opportunities", label: "Opportunities" },
  { key: "events", label: "Events" },
];

export default function ListingsTab() {
  const [tab, setTab] = useState("jobs");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "jobs" && <JobsTab />}
      {tab === "opportunities" && <OpportunitiesTab />}
      {tab === "events" && <EventsTab />}
    </div>
  );
}
