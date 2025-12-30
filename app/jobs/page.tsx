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

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-block mb-4">
            <Badge className="bg-blue-100 text-blue-800 pointer-events-none">OPPORTUNITIES</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">Jobs & Opportunities</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
            {jobs.length} positions posted by our TFN community members - find your next opportunity
          </p>
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
                company={
                  job.school
                    ? job.school.name
                    : job.createdBy
                      ? `${job.createdBy.firstName} ${job.createdBy.lastName}`
                      : "TFN Network"
                }
                location={job.location}
                jobType={job.jobType}
                description={job.description}
                requiredSkills={requiredSkills}
                onApply={() =>
                  alert(
                    "Application feature coming soon! For now, contact the poster directly."
                  )
                }
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
    </div>
  )
}
