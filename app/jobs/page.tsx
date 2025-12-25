"use client"

import { useEffect, useState } from "react"
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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Jobs & Opportunities</h1>
        <p className="text-gray-600">
          {jobs.length} opportunities posted by TFN community members
        </p>
      </div>

      <div className="space-y-4">
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
            <JobPostingCard
              key={job.id}
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
              applicants={job.applications.length}
              onApply={() =>
                alert(
                  "Application feature coming soon! For now, contact the poster directly."
                )
              }
            />
          )
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No jobs posted yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
