"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import OpportunityCard from "../../components/OpportunityCard";
import { Badge } from "@/components/ui/badge";

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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "/api/opportunities";
    const params = [];
    if (typeFilter) params.push(`type=${encodeURIComponent(typeFilter)}`);
    if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
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
  }, [typeFilter, statusFilter, showMine]);

  // Example types for filter dropdown
  const opportunityTypes = [
    "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col gap-6">
          {/* Header and Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Label */}
            <div className="flex-1 flex items-center sm:justify-start justify-center">
              <div className="flex items-center">
                <span>
                  <span className="sr-only">Opportunities</span>
                  <Badge className="bg-purple-600 text-white border-0 px-4 py-2 text-base font-bold tracking-wide uppercase pointer-events-none">Opportunities</Badge>
                </span>
              </div>
            </div>
            {/* Center: Filters */}
            <div className="flex-1 flex justify-center">
              <div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row items-center gap-3">
                <label className="mr-2 font-semibold text-purple-700">Type</label>
                <select
                  className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {opportunityTypes.map((type) => (
                    <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <label className="ml-4 mr-2 font-semibold text-purple-700">Status</label>
                <select
                  className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            {/* Right: Show Mine */}
            <div className="flex-1 flex items-center sm:justify-end justify-center">
              {status === "authenticated" && (
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showMine}
                    onChange={e => setShowMine(e.target.checked)}
                    className="accent-purple-600"
                  />
                  Show only mine
                </label>
              )}
            </div>
          </div>
          {/* Two Column Opportunity Grid */}
          {loading ? (
            <div className="text-center text-gray-500">Loading opportunities...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.length === 0 ? (
                <div className="text-center text-gray-400 col-span-2">No opportunities found.</div>
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
