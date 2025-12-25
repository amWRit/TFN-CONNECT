"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExperienceCard } from "@/components/ExperienceCard"
import { Button } from "@/components/ui/button"

interface PersonDetail {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  bio?: string
  type: string
  empStatus: string
  educations: Array<{
    id: string
    name: string
    level: string
    institution: string
    start: string
    end?: string
  }>
  experiences: Array<{
    id: string
    title: string
    orgName: string
    description?: string
    start: string
    end?: string
    experienceSkills: Array<{
      skill: {
        name: string
        category: string
      }
    }>
  }>
  fellowships: Array<{
    id: string
    years: number
    start: string
    end?: string
    cohort: {
      name: string
    }
  }>
  placements: Array<{
    id: string
    school: {
      name: string
    }
    startDate: string
    endDate?: string
  }>
}

export default function AlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setId(id)
    })
  }, [params])

  useEffect(() => {
    if (!id) return

    fetch(`/api/people/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPerson(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="flex items-start gap-6">
          {person.profileImage && (
            <img
              src={person.profileImage}
              alt={person.firstName}
              className="h-24 w-24 rounded-full"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {person.firstName} {person.lastName}
            </h1>
            {person.bio && <p className="text-gray-600 text-lg mb-4">{person.bio}</p>}
            <div className="flex gap-3 flex-wrap">
              <Badge>{person.type}</Badge>
              <Badge variant={person.empStatus === "employed" ? "default" : "secondary"}>
                {person.empStatus}
              </Badge>
              <Button>Connect</Button>
              <Button variant="outline">Message</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Experience */}
          {person.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Experience</h2>
              {person.experiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  title={exp.title}
                  company={exp.orgName}
                  startDate={new Date(exp.start)}
                  endDate={exp.end ? new Date(exp.end) : undefined}
                  description={exp.description}
                  skills={exp.experienceSkills.map((es) => es.skill)}
                />
              ))}
            </div>
          )}

          {/* Education */}
          {person.educations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Education</h2>
              {person.educations.map((edu) => (
                <Card key={edu.id} className="mb-4">
                  <CardHeader>
                    <CardTitle>{edu.name}</CardTitle>
                    <CardDescription>{edu.institution}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {edu.level} · {new Date(edu.start).getFullYear()} -{" "}
                      {edu.end
                        ? new Date(edu.end).getFullYear()
                        : "Present"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Fellowships */}
          {person.fellowships.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fellowships</CardTitle>
              </CardHeader>
              <CardContent>
                {person.fellowships.map((fellowship) => (
                  <div key={fellowship.id} className="mb-4">
                    <p className="font-semibold">{fellowship.cohort.name}</p>
                    <p className="text-sm text-gray-600">
                      {fellowship.years} years
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(fellowship.start).getFullYear()} -{" "}
                      {fellowship.end
                        ? new Date(fellowship.end).getFullYear()
                        : "Present"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Placements */}
          {person.placements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Placements</CardTitle>
              </CardHeader>
              <CardContent>
                {person.placements.map((placement) => (
                  <div key={placement.id} className="mb-4">
                    <p className="font-semibold">{placement.school.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(placement.startDate).getFullYear()} -{" "}
                      {placement.endDate
                        ? new Date(placement.endDate).getFullYear()
                        : "Present"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
