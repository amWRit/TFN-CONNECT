"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  let requiredSkills: string[] = []
  if (job.requiredSkills) {
    try {
      requiredSkills = JSON.parse(job.requiredSkills)
    } catch {
      requiredSkills = []
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="bg-white border-2 border-blue-400 shadow-lg rounded-3xl overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-blue-800 mb-2">{job.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-800">{job.jobType}</Badge>
              {job.location && <Badge className="bg-green-100 text-green-800">{job.location}</Badge>}
              {job.school && <Badge className="bg-yellow-100 text-yellow-800">{job.school.name}</Badge>}
            </div>
            {job.createdBy && (
              <div className="text-sm text-gray-500">Posted by {job.createdBy.firstName} {job.createdBy.lastName}</div>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
            {requiredSkills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill, idx) => (
                    <Badge key={idx} className="bg-indigo-100 text-indigo-800">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">
                Apply (Coming Soon)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
