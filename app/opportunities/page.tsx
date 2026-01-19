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
  overview: string;
  location?: string;
  types: string[];
  status: string;
  createdById: string;
  createdByName: string;
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showMine, setShowMine] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 18;

  useEffect(() => {
    setLoading(true);
    setPage(1);
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

  // Determine admin view (NextAuth ADMIN or localStorage bypass admin)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localAdmin = localStorage.getItem("adminAuth") === "true";
    const sessionIsAdmin = !!(session && (session as any).user && (session as any).user.type === "ADMIN");
    setIsAdminView(localAdmin || sessionIsAdmin);
  }, [session]);

  // Example types for filter dropdown
  const opportunityTypes = [
    "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
  ];

  const totalPages = Math.max(1, Math.ceil(opportunities.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOpportunities = opportunities.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-2 pb-8 sm:pt-4 sm:pb-10">
        <div className="flex flex-col gap-2">
          {/* Header and Filters Row */}
        <div className="sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-3">
            <div className="inline-block mb-2 sm:mb-0">
              <Badge className="bg-purple-600 text-white border-0 px-4 py-2 text-base font-bold tracking-wide uppercase shadow pointer-events-none text-lg px-6 py-2">Opportunities</Badge>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:flex-1 flex justify-center">
                <div className="bg-white/80 border border-purple-200 rounded-xl shadow px-4 py-3 flex flex-row flex-wrap items-center gap-3 w-full">
                  <div className="w-full sm:w-auto">
                    <label className="block sm:inline mr-2 font-semibold text-purple-700">Type</label>
                    <select
                      className="w-full sm:w-auto border border-purple-300 bg-white rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      {opportunityTypes.map((type) => (
                        <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block sm:inline mr-2 font-semibold text-purple-700">Status</label>
                    <select
                      className="w-full sm:w-auto border border-purple-300 bg-white rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto flex items-center justify-end gap-4 mt-2 sm:mt-0">
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
                {opportunities.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="hidden sm:inline">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                        currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                        currentPage >= totalPages
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Two Column Opportunity Grid */}
          {loading ? (
            <div className="text-center text-gray-500">Loading opportunities...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities.length === 0 ? (
                  <div className="text-center text-gray-400 col-span-2">No opportunities found.</div>
                ) : (
                  paginatedOpportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      id={opp.id}
                      title={opp.title}
                      overview={opp.overview}
                      location={opp.location}
                      types={opp.types}
                      createdByName={opp.createdByName}
                      status={opp.status}
                      createdById={opp.createdById}
                      showOverviewOnly={true}
                      adminView={isAdminView}
                    />
                  ))
                )}
              </div>
              {opportunities.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
                  <span>
                    Showing {Math.min((currentPage - 1) * pageSize + 1, opportunities.length)}–
                    {Math.min(currentPage * pageSize, opportunities.length)} of {opportunities.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                        currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Prev
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                        currentPage >= totalPages
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Floating Add New Opportunity Button (only if signed in and NOT admin view) */}
      {status === "authenticated" && !isAdminView && (
        <button
          onClick={handleAddOpportunity}
          className="fixed bottom-20 sm:bottom-8 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
          title="Add New Opportunity"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="hidden sm:inline">Add Opportunity</span>
        </button>
      )}
    </>
  );
}
