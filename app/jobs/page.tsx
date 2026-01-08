"use client"

import { useEffect, useState } from "react"
import Select from "react-select"
import { useSession } from "next-auth/react"
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
  deadline?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession();
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

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {jobs
            .filter(job =>
              (!showOnlyMine || (session?.user && job.createdBy?.id === session.user.id)) &&
              (!typeFilter || job.jobType === typeFilter) &&
              (!statusFilter || job.status === statusFilter) &&
              (skillsFilter.length === 0 || (job.requiredSkills && skillsFilter.every(f => job.requiredSkills?.includes(f.value))))
            )
            .map(job => {
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
                    description={job.description}
                    requiredSkills={requiredSkills}
                    createdBy={job.createdBy}
                    deadline={job.deadline}
                    href={`/jobs/${job.id}`}
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
