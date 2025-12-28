"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExperienceCard } from "@/components/ExperienceCard"
import { ProfileImage } from "@/components/ProfileImage"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Briefcase, Mail, Phone, Linkedin, Globe, GraduationCap } from "lucide-react"

interface PersonDetail {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  bio?: string
  type: string
  empStatus: string
  email1?: string
  email2?: string
  phone1?: string
  phone2?: string
  linkedin?: string
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
    type?: string
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
    subjects: string[]
    cohort: {
      name: string
    }
    placement: {
      school: {
        name: string
      }
    }
  }>
  managedPlacements: Array<{
    id: string
    school: {
      name: string
    }
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
  const [bookmarked, setBookmarked] = useState(false)

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
        <Card className="bg-white border-2 border-indigo-500 shadow-lg rounded-3xl overflow-hidden mb-8 relative">
          {/* Bookmark Button */}
          <div className="group absolute top-4 right-4 z-10">
            <button
              aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
              onClick={() => setBookmarked((b) => !b)}
              className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110`}
            >
              {bookmarked ? <BookmarkCheck size={28} /> : <Bookmark size={28} />}
            </button>
            <span className="opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 absolute right-0 mt-2 whitespace-nowrap pointer-events-none shadow-lg" style={{top: '100%'}}>Save</span>
          </div>
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="absolute inset-0 flex items-end px-6 sm:px-8 pb-6 gap-6">
              <div className="flex-shrink-0">
                <ProfileImage
                  src={person.profileImage}
                  name={`${person.firstName} ${person.lastName}`}
                  className="h-28 w-28 rounded-2xl border-4 border-indigo-200 shadow-md object-cover"
                  alt={`${person.firstName} ${person.lastName}`}
                />
              </div>
              <div className="flex flex-col justify-end pb-2 flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {person.firstName} {person.lastName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="text-xs font-semibold bg-red-100 text-red-700 pointer-events-none">⭐ {person.type}</Badge>
                  <Badge className="text-xs font-semibold bg-red-100 text-red-700 pointer-events-none">
                    {person.empStatus === "EMPLOYED" && "✓ Employed"}
                    {person.empStatus === "SEEKING" && "🔍 Seeking"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative px-6 sm:px-8 pt-6 pb-8">
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                {person.bio && (
                  <p className="text-gray-600 text-base leading-relaxed mb-5">
                    {person.bio}
                  </p>
                )}

                {/* Bio (full width) */}
                {/* {person.bio && (
                  <div className="text-gray-600 text-base leading-relaxed mb-5 col-span-1 sm:col-span-2">
                    <blockquote className="border-l-4 border-yellow-400 bg-yellow-50/60 px-4 py-3 my-2 text-yellow-900 relative">
                      <span className="absolute -left-3 top-2 text-yellow-400">
                      </span>
                      <span className="pl-6 block">{person.bio}</span>
                    </blockquote>
                  </div>
                )} */}

                {/* Two-column Info Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm">
                  {/* Email1 */}
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-blue-500" />
                    <span>{person.email1}</span>
                  </div>
                  {/* Email2 */}
                  <div className="flex items-center gap-2">
                    {person.email2 && <><Mail size={18} className="text-blue-500" /><span>{person.email2}</span></>}
                  </div>
                  {/* Phone1 */}
                  <div className="flex items-center gap-2">
                    {person.phone1 && <><Phone size={18} className="text-green-500" /><span>{person.phone1}</span></>}
                  </div>
                  {/* Phone2 */}
                  <div className="flex items-center gap-2">
                    {person.phone2 && <><Phone size={18} className="text-green-500" /><span>{person.phone2}</span></>}
                  </div>
                  {/* LinkedIn */}
                  <div className="flex items-center gap-2">
                    <Linkedin size={18} className="text-blue-700" />
                    {person.linkedin ? (
                      <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{person.linkedin}</a>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                  {/* Website */}
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-blue-700" />
                    <a href="https://www.teachfornepal.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">www.teachfornepal.org</a>
                  </div>
                  {/* Education Status */}
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500" />
                    <span className="font-medium text-gray-700">Education Status:</span>
                    <span className="font-normal">{(() => {
                      // Assume most recent education status is the person's status
                      return person.educations && person.educations.length > 0 ? 'COMPLETED' : 'N/A';
                    })()}</span>
                  </div>
                  {/* Recent Degree */}
                  <div className="flex items-center gap-2">
                    {person.educations && person.educations.length > 0 && (() => {
                      const recentEdu = [...person.educations].sort((a, b) => {
                        const aDate = new Date(a.end || a.start).getTime();
                        const bDate = new Date(b.end || b.start).getTime();
                        return bDate - aDate;
                      })[0];
                      return recentEdu ? (
                        <span className="flex items-center gap-1 text-blue-800">Recent: {recentEdu.name}</span>
                      ) : null;
                    })()}
                  </div>
                  {/* Employment Status */}
                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-green-600" />
                    <span className="font-medium text-gray-700">Employment Status:</span>
                    <span className="font-normal">{person.empStatus}</span>
                  </div>
                  {/* Recent Job */}
                  <div className="flex items-center gap-2">
                    {person.empStatus === "EMPLOYED" && person.experiences && person.experiences.length > 0 && (() => {
                      const recentExp = [...person.experiences].sort((a, b) => {
                        const aDate = new Date(a.end || a.start).getTime();
                        const bDate = new Date(b.end || b.start).getTime();
                        return bDate - aDate;
                      })[0];
                      return recentExp ? (
                        <span className="flex items-center gap-1 text-green-800">Recent: {recentExp.type ? recentExp.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'N/A'} at {recentExp.orgName}</span>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Bookmark button moved to card top right */}
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
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Fellowships
              </h2>
              <div className="space-y-4">
              {person.fellowships.map((fellowship) => (
                <Card key={fellowship.id} className="border-2 border-blue-400 rounded-xl hover:shadow-lg hover:border-blue-500 transition bg-white">
                  <CardHeader>
                    <CardTitle>{fellowship.cohort.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {fellowship.placement.school.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Subjects: {fellowship.subjects.join(', ')}
                    </p>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
          )}

          {/* Managed Placements (if staff) */}
          {person.managedPlacements && person.managedPlacements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                Managed Placements
              </h2>
              <div className="space-y-4">
              {person.managedPlacements.map((placement) => (
                <Card key={placement.id} className="border-2 border-pink-400 rounded-xl hover:shadow-lg hover:border-pink-500 transition bg-white">
                  <CardHeader>
                    <CardTitle>{placement.school.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
