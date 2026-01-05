"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import OpportunityCard from "../../components/OpportunityCard";

const handleAddOpportunity = () => {
// TODO: Navigate to opportunity creation page or open modal
window.location.href = "/opportunities/new";
};

interface Opportunity {
  id: string;
  title: string;
  description: string;
  types: string[];
  status: string;
  createdById: string;
}

export default function OpportunitiesPage() {
  const { status } = useSession();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "/api/opportunities";
    const params = [];
    if (typeFilter) params.push(`type=${encodeURIComponent(typeFilter)}`);
    if (showMine) params.push("mine=true");
    if (params.length) url += `?${params.join("&")}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load opportunities");
        setLoading(false);
      });
  }, [typeFilter, showMine]);

  // Example types for filter dropdown
  const opportunityTypes = [
    "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
  ];

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-700">Opportunities</h1>
        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div>
            <label className="mr-2 font-medium">Type:</label>
            <select
              className="border rounded px-2 py-1"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {opportunityTypes.map((type) => (
                <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          {status === "authenticated" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMine}
                onChange={e => setShowMine(e.target.checked)}
                className="accent-blue-600"
              />
              Show only mine
            </label>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading opportunities...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid gap-6">
            {opportunities.length === 0 ? (
              <div className="text-center text-gray-400">No opportunities found.</div>
            ) : (
              opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  id={opp.id}
                  title={opp.title}
                  description={opp.description}
                  types={opp.types}
                  status={opp.status}
                />
              ))
            )}
          </div>
        )}
      </div>
      {/* Floating Add New Opportunity Button */}
      <button
        onClick={handleAddOpportunity}
        className="fixed bottom-8 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
        title="Add New Opportunity"
      >
        <span className="text-2xl leading-none">＋</span>
        <span className="hidden sm:inline">Add Opportunity</span>
      </button>
    </>
  );
}
