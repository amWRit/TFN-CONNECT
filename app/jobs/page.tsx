"use client"

import { useEffect, useState } from "react"
import Select from "react-select"
import { useSession } from "next-auth/react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { JobPostingCard } from "@/components/JobPostingCard"

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
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession();
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [skillsFilter, setSkillsFilter] = useState<{ value: string; label: string }[]>([]);
  const [allSkills, setAllSkills] = useState<{ value: string; label: string }[]>([]);

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

  // Fetch bookmark state for each job when session is ready
  useEffect(() => {
    if (!session || !session.user) return;
    const fetchBookmarks = async () => {
      const states: Record<string, { bookmarked: boolean; loading: boolean }> = {};
      await Promise.all(
        jobs.map(async (job) => {
          try {
            const res = await fetch(`/api/bookmarks/job?targetJobId=${job.id}`);
            const data = await res.json();
            states[job.id] = { bookmarked: !!data.bookmarked, loading: false };
          } catch {
            states[job.id] = { bookmarked: false, loading: false };
          }
        })
      );
      setBookmarkStates(states);
    };
    if (jobs.length > 0) fetchBookmarks();
  }, [session, jobs]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center">Loading jobs...</div>
      </div>
    )
  }

  const handleAddJob = () => {
    window.location.href = "/jobs/new";
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8 sm:pt-6 sm:pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="inline-block mb-2 sm:mb-0">
            <Badge className="bg-blue-600 text-white border-0 px-4 py-2 text-base font-bold tracking-wide uppercase shadow pointer-events-none text-lg px-6 py-2">Jobs</Badge>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full flex justify-center">
              <div className="bg-white/80 border border-blue-100 rounded-xl shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <label className="mr-2 font-semibold text-blue-700">Type</label>
                  <select
                    className="border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition"
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
                <div>
                  <label className="mr-2 font-semibold text-blue-700">Status</label>
                  <select
                    className="border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 outline-none transition"
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
                <div className="min-w-[180px] flex items-center gap-2">
                  <label className="font-semibold text-blue-700 whitespace-nowrap">Skills</label>
                  <div className="flex-1 min-w-[120px]">
                    <Select
                      isMulti
                      options={allSkills}
                      value={skillsFilter}
                      onChange={(newValue) => setSkillsFilter(Array.isArray(newValue) ? [...newValue] : [])}
                      classNamePrefix="react-select"
                      placeholder="All"
                      styles={{ menu: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minHeight: '32px', borderColor: '#bfdbfe', boxShadow: 'none' }) }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {session?.user && (
              <div className="flex-1 flex justify-end">
                <label className="flex items-center gap-2 select-none text-sm font-medium text-gray-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={showOnlyMine}
                    onChange={e => setShowOnlyMine(e.target.checked)}
                  />
                  Show Only Mine
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        {(showOnlyMine && session?.user
          ? jobs.filter(job => job.createdBy && job.createdBy.id === session.user.id)
          : jobs
        )
        .filter(job => !typeFilter || job.jobType === typeFilter)
        .filter(job => !statusFilter || job.status === statusFilter)
        .filter(job =>
          skillsFilter.length === 0 ||
          (Array.isArray(job.requiredSkills) && skillsFilter.every(sf => job.requiredSkills?.includes(sf.value)))
        )
        .map((job) => {
          let requiredSkillIds: string[] = [];
          if (Array.isArray(job.requiredSkills)) {
            requiredSkillIds = job.requiredSkills;
          } else if (typeof job.requiredSkills === 'string') {
            try {
              requiredSkillIds = JSON.parse(job.requiredSkills);
            } catch {
              requiredSkillIds = [];
            }
          }
          const requiredSkills = requiredSkillIds.map((id) => skillMap[id] || id);

          const showBookmark = session && session.user;
          const bookmarkState = bookmarkStates[job.id] || { bookmarked: false, loading: false };

          return (
            <div key={job.id} className="relative group">
              <JobPostingCard
                id={job.id}
                title={job.title}
                company={job.school ? job.school.name : undefined}
                location={job.location}
                jobType={job.jobType}
                status={job.status}
                description={job.description}
                requiredSkills={requiredSkills}
                createdBy={job.createdBy}
                href={`/jobs/${job.id}`}
              />
              {/* Bookmark Button (only for signed-in users) */}
              {showBookmark && (
                <button
                  aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                  disabled={bookmarkState.loading}
                  onClick={async (e) => {
                    e.preventDefault();
                    setBookmarkStates((prev) => ({
                      ...prev,
                      [job.id]: { ...prev[job.id], loading: true },
                    }));
                    try {
                      const res = await fetch("/api/bookmarks/job", {
                        method: bookmarkState.bookmarked ? "DELETE" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetJobId: job.id }),
                      });
                      if (res.ok) {
                        setBookmarkStates((prev) => ({
                          ...prev,
                          [job.id]: { bookmarked: !bookmarkState.bookmarked, loading: false },
                        }));
                      } else {
                        setBookmarkStates((prev) => ({
                          ...prev,
                          [job.id]: { ...prev[job.id], loading: false },
                        }));
                      }
                    } catch {
                      setBookmarkStates((prev) => ({
                        ...prev,
                        [job.id]: { ...prev[job.id], loading: false },
                      }));
                    }
                  }}
                  className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarkState.bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60 ml-2`}
                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                >
                  {bookmarkState.bookmarked ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
                </button>
              )}
            </div>
          )
        })}
        </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No jobs posted yet. Check back soon!</p>
        </div>
      )}
      </div>

      {/* Floating Add New Job Button (only if signed in) */}
      {status === "authenticated" && (
        <button
          onClick={handleAddJob}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
          title="Add New Job"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="hidden sm:inline">Add Job</span>
        </button>
      )}
    </div>
  )
}
