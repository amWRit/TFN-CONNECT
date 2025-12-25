"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
  }, [])

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
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">OPPORTUNITIES</Badge>
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

          return (
            <div key={job.id}>
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
