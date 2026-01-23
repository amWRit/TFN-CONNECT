"use client";

import { useState } from "react";
import JobsTab from "./JobsTab";
import OpportunitiesTab from "./OpportunitiesTab";
import EventsTab from "./EventsTab";
import PostsTab from "./PostsTab";
import { Briefcase, Users, Calendar, MessageSquare, Rocket } from "lucide-react";

const TABS = [
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "opportunities", label: "Opportunities", icon: Rocket },
  { key: "events", label: "Events", icon: Calendar },
  { key: "posts", label: "Posts", icon: MessageSquare },
];

export default function ListingsTab() {
  const [tab, setTab] = useState("jobs");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 mb-4 w-full max-w-full overflow-x-auto border-b border-blue-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-row items-center justify-center gap-2 px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                tab === t.key
                  ? 'border-blue-600 text-white bg-blue-500'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              style={{ minWidth: 0, borderRadius: 0 }}
              title={t.label}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">{t.label}</span>
            </button>
          );
        })}
      </div>
      {tab === "jobs" && <JobsTab />}
      {tab === "opportunities" && <OpportunitiesTab />}
      {tab === "events" && <EventsTab />}
      {tab === "posts" && <PostsTab />}
    </div>
  );
}
