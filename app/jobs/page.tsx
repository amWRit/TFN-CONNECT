"use client"

import { useEffect, useState } from "react"
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
  requiredSkills?: string
  school?: {
    name: string
  }
  createdBy?: {
    firstName: string
    lastName: string
  }
  applications: Array<{
    id: string
  }>
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession();
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
  }, [])

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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        {/* Header Section */}
        <div>
          <div className="inline-block">
            <Badge className="bg-blue-100 text-blue-800 pointer-events-none text-lg px-6 py-2">Jobs</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        {jobs.map((job) => {
          let requiredSkills: string[] = []
          if (job.requiredSkills) {
            try {
              requiredSkills = JSON.parse(job.requiredSkills)
            } catch {
              requiredSkills = []
            }
          }

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

      {/* Floating Add New Job Button */}
      <button
        onClick={handleAddJob}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
        title="Add New Job"
      >
        <span className="text-2xl leading-none">＋</span>
        <span className="hidden sm:inline">Add Job</span>
      </button>
    </div>
  )
}
