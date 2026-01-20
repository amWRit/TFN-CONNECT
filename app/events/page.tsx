"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { EventType, EventStatus } from "@prisma/client";
import EventCard from "@/components/EventCard";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus } from "lucide-react"

interface Event {
  id: string;
  title: string;
  overview?: string;
  description?: string;
  location?: string;
  type: string;
  status: string;
  startDateTime: string;
  endDateTime?: string;
  capacity?: number;
  rsvpCount?: number;
  isFree?: boolean;
  price?: number;
  createdById: string;
  createdByName?: string;
}

const eventTypes: string[] = Object.values(EventType);
const eventStatuses: string[] = Object.values(EventStatus);

export default function EventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showMine, setShowMine] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 18;
  // Collapsible filter state for small screens
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    let url = "/api/events";
    const params = [];
    if (typeFilter) params.push(`type=${encodeURIComponent(typeFilter)}`);
    if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
    if (showMine) params.push("mine=true");
    if (params.length) url += `?${params.join("&")}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load events");
        setLoading(false);
      });
  }, [typeFilter, statusFilter, showMine]);

  // Determine admin view
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localAdmin = localStorage.getItem("adminAuth") === "true";
    const sessionIsAdmin = !!(session && (session as any).user && (session as any).user.type === "ADMIN");
    setIsAdminView(localAdmin || sessionIsAdmin);
  }, [session]);

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = events.slice(startIndex, startIndex + pageSize);

  const handleAddEvent = () => {
    window.location.href = "/events/new";
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-8 sm:pt-4 sm:pb-10">
        {/* Header Section */}
        <div className="sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-2">
          {/* Row for Events label and Show Filters button on small screens */}
          <div className="flex flex-row items-center justify-between w-full sm:w-auto mb-0 sm:mb-0">
            <Badge className="bg-emerald-600 text-white border-0 px-4 py-2 font-bold tracking-wide uppercase shadow pointer-events-none text-base text-sm
             px-4 sm:px-6 py-2">
              Events
            </Badge>
            {/* Collapsible filter toggle for small screens */}
            <button
              type="button"
              className="px-3 py-1 rounded border border-emerald-300 text-emerald-700 bg-white text-sm font-medium shadow-sm hover:bg-emerald-50 transition sm:hidden ml-2 flex items-center gap-2"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={16} className="inline-block" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Filter section: always visible on sm+, collapsible on small screens */}
            <div
              className={`w-full sm:flex-1 flex justify-center ${showFilters ? "" : "hidden"} sm:flex`}
            >
              <div className="bg-white/80 border border-emerald-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap items-center gap-3 w-full">
                <div className="w-full sm:w-auto">
                  <label className="block sm:inline mr-2 font-semibold text-emerald-700">Type</label>
                  <select
                    className="w-full sm:w-auto border border-emerald-200 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-300 outline-none transition"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block sm:inline mr-2 font-semibold text-emerald-700">Status</label>
                  <select
                    className="w-full sm:w-auto border border-emerald-200 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-300 outline-none transition"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {eventStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Show only mine filter inside filters */}
                {status === "authenticated" && (
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 whitespace-nowrap w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={showMine}
                      onChange={(e) => setShowMine(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    Show only mine
                  </label>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center justify-end gap-2 mt-1 sm:mt-0">
              {events.length > 0 && (
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
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
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
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading events...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="text-center text-gray-400 col-span-3 py-12">No events found.</div>
              ) : (
                paginatedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    overview={event.overview}
                    location={event.location}
                    type={event.type}
                    status={event.status}
                    startDateTime={event.startDateTime}
                    endDateTime={event.endDateTime}
                    capacity={event.capacity}
                    rsvpCount={event.rsvpCount}
                    isFree={event.isFree}
                    price={event.price}
                    createdByName={event.createdByName}
                    createdById={event.createdById}
                    showOverviewOnly={true}
                    adminView={isAdminView}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {events.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No events posted yet. Check back soon!</p>
              </div>
            )}

            {/* Bottom pagination summary */}
            {events.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, events.length)}–
                  {Math.min(currentPage * pageSize, events.length)} of {events.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                      currentPage === 1
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
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
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
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

      {/* Floating Add New Event Button (only if signed in and NOT admin view) */}
      {status === "authenticated" && !isAdminView && (
        <button
          onClick={handleAddEvent}
          className="fixed bottom-20 sm:bottom-8 right-8 z-50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
          title="Add New Event"
        >
          <Plus className="w-7 h-7" />
          <span className="hidden sm:inline">Add Event</span>
        </button>
      )}
    </div>
  );
}
