"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImage } from "@/components/ProfileImage"
import Link from "next/link"

interface Person {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  bio?: string
  type: string
  empStatus: string
  experiences?: Array<{
    id: string
    title: string
    orgName: string
  }>
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then((data) => {
        // Filter to show alumni only
        const filtered = data.filter(
          (p: Person) => p.type === "ALUMNI"
        )
        setAlumni(filtered)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="mb-12 sm:mb-16">
          <div className="inline-block mb-4">
            <Badge className="bg-red-100 text-red-700 pointer-events-none">COMMUNITY</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">TFN Alumni & Network</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
            Connect with {alumni.length} inspiring education leaders and changemakers across Nepal
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {alumni.map((person) => (
            <Link key={person.id} href={`/alumni/${person.id}`} className="group">
              <Card className="h-full hover:shadow-2xl hover:border-blue-400 transition-all duration-300 cursor-pointer border-2 border-blue-300 bg-white rounded-2xl overflow-hidden">
                {/* Status Bar */}
                <div className={`h-1 w-full ${
                  person.empStatus === "EMPLOYED"
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : person.empStatus === "SEEKING"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                }`} />
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-16 w-16 rounded-full border-3 border-blue-100 overflow-hidden group-hover:border-blue-300 transition shadow-md">
                        <ProfileImage
                          src={person.profileImage}
                          name={`${person.firstName} ${person.lastName}`}
                          className="h-full w-full object-cover"
                          alt={`${person.firstName} ${person.lastName}`}
                        />
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-2 text-xs font-semibold bg-red-100 text-red-700 pointer-events-none">
                          ⭐ Alumni
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {person.firstName} {person.lastName}
                  </CardTitle>
                  
                  {person.experiences && person.experiences[0] && (
                    <div className="text-sm text-gray-600 font-medium mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">💼</span>
                        <span>{person.experiences[0].title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{person.experiences[0].orgName}</div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {person.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      "{person.bio}"
                    </p>
                  )}
                  
                  {/* Employment Status Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-100 text-red-700 pointer-events-none"
                    >
                      {person.empStatus === "EMPLOYED" && "✓ Employed"}
                      {person.empStatus === "SEEKING" && "🔍 Seeking"}
                      {person.empStatus !== "EMPLOYED" && person.empStatus !== "SEEKING" && person.empStatus}
                    </span>
                    <span className="text-xs text-gray-400">View Profile →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
