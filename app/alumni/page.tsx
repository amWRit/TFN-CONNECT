"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        // Filter to show alumni and LDC
        const filtered = data.filter(
          (p: Person) => p.type === "alumni" || p.type === "LDC"
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">TFN Alumni & Network</h1>
        <p className="text-gray-600">
          {alumni.length} members in our community
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((person) => (
          <Link key={person.id} href={`/alumni/${person.id}`}>
            <Card className="h-full hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  {person.profileImage && (
                    <img
                      src={person.profileImage}
                      alt={person.firstName}
                      className="h-12 w-12 rounded-full mr-3"
                    />
                  )}
                  <Badge variant="outline">
                    {person.type === "LDC" ? "LDC/Staff" : "Alumni"}
                  </Badge>
                </div>
                <CardTitle>
                  {person.firstName} {person.lastName}
                </CardTitle>
                {person.experiences && person.experiences[0] && (
                  <CardDescription>
                    {person.experiences[0].title} at{" "}
                    {person.experiences[0].orgName}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {person.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {person.bio}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      person.empStatus === "employed"
                        ? "bg-green-100 text-green-800"
                        : person.empStatus === "seeking"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {person.empStatus}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
