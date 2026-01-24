"use client"

import { useEffect, useState, useMemo } from "react"
import Select from "react-select"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { JobPostingCard } from "@/components/JobPostingCard"
import { Filter, Plus } from "lucide-react"
import LoadingSpinner from "../../components/ui/LoadingSpinner";

interface JobPosting {
  id: string
  title: string
  description: string
  location?: string
  jobType: string
  requiredSkills?: string[]
  school?: {
    name: string
  }
  createdBy?: {
    id: string
    firstName: string
    lastName: string
  }
  applications: Array<{
    id: string
  }>
  status?: string
  deadline?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession();
  const [isAdminView, setIsAdminView] = useState(false);
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [skillsFilter, setSkillsFilter] = useState<{ value: string; label: string }[]>([]);
  const [allSkills, setAllSkills] = useState<{ value: string; label: string }[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 18;
  // Collapsible filter state for small screens
  const [showFilters, setShowFilters] = useState(false);

  // Utility to extract job IDs from batch bookmarks response
  function extractBookmarkedJobIds(bookmarks: any): Set<string> {
    if (!bookmarks || !Array.isArray(bookmarks.jobs)) return new Set();
    return new Set(bookmarks.jobs.map((b: any) => b.targetId));
  }
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(new Set());
  // Fetch all job bookmarks for the current user (batch API)

  useEffect(() => {
    if (!session || !session.user || isAdminView) return;
    let ignore = false;
    async function fetchBookmarks() {
      try {
        const res = await fetch('/api/bookmarks/all');
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) setBookmarkedJobIds(extractBookmarkedJobIds(data));
      } catch {
        if (!ignore) setBookmarkedJobIds(new Set());
      }
    }
    fetchBookmarks();
    return () => { ignore = true; };
  }, [session, isAdminView]);

  useEffect(() => {
    async function fetchData() {
      const [jobsRes, skillsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/skills")
      ]);
      const jobsData = await jobsRes.json();
      const skillsData = await skillsRes.json();
      const map: Record<string, string> = {};
      for (const skill of skillsData) {
        map[skill.id] = skill.name;
      }
      setSkillMap(map);
      setJobs(jobsData);
      setAllSkills(skillsData.map((s: any) => ({ value: s.id, label: s.name })));
      setLoading(false);
    }
    fetchData();
  }, []);

  // Determine admin view (NextAuth ADMIN or localStorage bypass admin)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localAdmin = localStorage.getItem("adminAuth") === "true";
    const sessionIsAdmin = !!(session && (session as any).user && (session as any).user.type === "ADMIN");
    setIsAdminView(localAdmin || sessionIsAdmin);
  }, [session]);

  // Derived filtered jobs
  const filteredJobs = useMemo(
    () =>
      jobs.filter(job =>
        (!showOnlyMine || (session?.user && job.createdBy?.id === session.user.id)) &&
        (!typeFilter || job.jobType === typeFilter) &&
        (!statusFilter || job.status === statusFilter) &&
        (skillsFilter.length === 0 || (job.requiredSkills && skillsFilter.every(f => job.requiredSkills?.includes(f.value))))
      ),
    [jobs, showOnlyMine, session, typeFilter, statusFilter, skillsFilter]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [showOnlyMine, typeFilter, statusFilter, skillsFilter, session]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page, pageSize]);


  if (loading) {
    return <LoadingSpinner text="Loading jobs..." />;
  }

  const handleAddJob = () => {
    window.location.href = "/jobs/new";
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-8 mb-16 sm:mb-0">
        {/* Header Section */}
        <div className="sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60 py-2">
          {/* Row for Jobs label and Show Filters button on small screens */}
          <div className="flex flex-row items-center justify-between w-full sm:w-auto mb-1 sm:mb-0">
            <Badge className="bg-blue-600 text-white border-0 px-4 py-2 font-bold tracking-wide uppercase shadow pointer-events-none text-base text-sm px-4 sm:px-6 py-2">Jobs</Badge>
            {/* Collapsible filter toggle for small screens */}
            <button
              type="button"
              className="px-3 py-1 rounded border border-blue-300 text-blue-700 bg-white text-sm font-medium shadow-sm hover:bg-blue-50 transition sm:hidden ml-2 flex items-center gap-2"
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
              <div className="bg-white/80 border border-blue-100 rounded-xl shadow-sm px-4 py-3 flex flex-row flex-wrap items-center gap-3 w-full">
                <div className="w-full sm:w-auto">
                  <label className="block sm:inline mr-2 font-semibold text-blue-700">Type</label>
                  <select
                    className="w-full sm:w-auto border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block sm:inline mr-2 font-semibold text-blue-700">Status</label>
                  <select
                    className="w-full sm:w-auto border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="OPEN">Open</option>
                    <option value="FILLED">Filled</option>
                    <option value="CLOSED">Closed</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[220px] flex items-center gap-2">
                  <label className="block sm:inline font-semibold text-blue-700 whitespace-nowrap">Skills</label>
                  <div className="flex-1 min-w-0">
                    <Select
                      isMulti
                      options={allSkills}
                      value={skillsFilter}
                      onChange={(newValue) => setSkillsFilter(Array.isArray(newValue) ? [...newValue] : [])}
                      classNamePrefix="react-select"
                      placeholder="All"
                      styles={{
                        menu: base => ({ ...base, zIndex: 9999 }),
                        control: base => ({ ...base, minHeight: '32px', borderColor: '#bfdbfe', boxShadow: 'none', width: '100%' })
                      }}
                    />
                  </div>
                </div>
                {/* Show Only Mine filter inside filters */}
                {session?.user && (
                  <label className="flex items-center gap-2 select-none text-sm font-medium text-gray-700 whitespace-nowrap w-full sm:w-auto">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={showOnlyMine}
                      onChange={e => setShowOnlyMine(e.target.checked)}
                    />
                    Show Only Mine
                  </label>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center justify-end gap-2 mt-1 sm:mt-0">
              {filteredJobs.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="hidden sm:inline">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                      page === 1
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                      page >= totalPages
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedJobs.map(job => {
              const requiredSkills = Array.isArray(job.requiredSkills)
                ? job.requiredSkills.map((id) => skillMap[id] || id)
                : [];
              return (
                <div key={job.id} className="relative">
                  <JobPostingCard
                    id={job.id}
                    title={job.title}
                    company={job.school ? job.school.name : undefined}
                    location={job.location}
                    jobType={job.jobType}
                    status={job.status}
                    overview={(job as any).overview}
                    description={job.description}
                    requiredSkills={requiredSkills}
                    createdBy={job.createdBy}
                    deadline={job.deadline}
                    href={`/jobs/${job.id}`}
                    adminView={isAdminView}
                    // Pass bookmark state from batch API
                    bookmarked={bookmarkedJobIds.has(job.id)}
                  />
                </div>
              );
            })}

        </div>

        {jobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No jobs posted yet. Check back soon!</p>
        </div>
      )}

        {/* Bottom pagination summary */}
        {filteredJobs.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-700">
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, filteredJobs.length)}–
              {Math.min(page * pageSize, filteredJobs.length)} of {filteredJobs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                  page === 1
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
              >
                Prev
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                  page >= totalPages
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add New Job Button (only if signed in and NOT admin view) */}
      {status === "authenticated" && !isAdminView && (
        <button
          onClick={handleAddJob}
          className="fixed bottom-20 sm:bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
          title="Add New Job"
        >
          <Plus className="w-7 h-7" />
          <span className="hidden sm:inline">Add Job</span>
        </button>
      )}
    </div>
  )
}
