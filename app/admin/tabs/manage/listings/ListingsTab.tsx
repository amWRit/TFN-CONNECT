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
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-row items-center justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors min-w-[44px] min-h-[44px] ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
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
