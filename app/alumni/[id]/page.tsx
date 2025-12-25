"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExperienceCard } from "@/components/ExperienceCard"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus } from "lucide-react"

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
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header Card */}
        <Card className="bg-white border-2 border-indigo-500 shadow-lg rounded-3xl overflow-hidden mb-8">
          {/* Cover gradient with name overlay */}
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-8 pb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {person.firstName} {person.lastName}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-xs font-semibold bg-white text-indigo-700">⭐ {person.type}</Badge>
                <Badge className={`text-xs font-semibold ${
                  person.empStatus === "employed"
                    ? "bg-green-300 text-green-900"
                    : "bg-blue-300 text-blue-900"
                }`}>
                  {person.empStatus === "employed" && "✓ Employed"}
                  {person.empStatus === "seeking" && "🔍 Seeking"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="relative px-6 sm:px-8 pt-6 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-start gap-6">
              {person.profileImage && (
                <img
                  src={person.profileImage}
                  alt={person.firstName}
                  className="h-28 w-28 rounded-2xl border-4 border-indigo-200 shadow-md object-cover -mt-20"
                />
              )}
              
              <div className="flex-1">
                {person.bio && (
                  <p className="text-gray-600 text-base leading-relaxed mb-5">
                    {person.bio}
                  </p>
                )}
                
                <div className="flex gap-3 flex-wrap">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
          {/* Experience */}
          {person.experiences.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">💼</span>
                Experience
              </h2>
              <div className="space-y-5">
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
            </div>
          )}

          {/* Education */}
          {person.educations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                Education
              </h2>
              <div className="space-y-4">
              {person.educations.map((edu) => (
                <Card key={edu.id} className="border-2 border-orange-400 rounded-xl hover:shadow-lg hover:border-orange-500 transition bg-white">
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
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fellowships */}
          {person.fellowships.length > 0 && (
            <Card className="border-2 border-blue-400 rounded-xl hover:shadow-lg hover:border-blue-500 transition bg-gradient-to-br from-blue-50 to-cyan-50">
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
            <Card className="border-2 border-pink-400 rounded-xl hover:shadow-lg hover:border-pink-500 transition bg-gradient-to-br from-purple-50 to-pink-50">
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
    </div>
  )
}
