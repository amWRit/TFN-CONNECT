"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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


import React from "react"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = React.use(params)

  useEffect(() => {
    if (!id) return
    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        setJob(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading job...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Job not found</div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.back()}>Go Back</button>
      </div>
    )
  }

  let requiredSkills: string[] = [];
  if (job.requiredSkills) {
    try {
      requiredSkills = JSON.parse(job.requiredSkills);
    } catch {
      requiredSkills = [];
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <JobPostingCard
          id={job.id}
          title={job.title}
          company={job.school ? job.school.name : undefined}
          location={job.location}
          jobType={job.jobType}
          description={job.description}
          requiredSkills={requiredSkills}
          createdBy={job.createdBy}
          applicants={job.applications?.length || 0}
          hideViewButton={true}
        />
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition text-lg"
            onClick={() => alert('Application feature coming soon! Please contact the admin or the poster directly.')}
          >
            Apply
          </button>
        </div>
        {/* Go Back button removed for cleaner UI */}
      </div>
    </div>
  );
}
