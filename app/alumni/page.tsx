"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImage } from "@/components/ProfileImage"
import Link from "next/link"
import { Bookmark, BookmarkCheck } from "lucide-react"


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
  const [cohortFilter, setCohortFilter] = useState("");
  const [empStatusFilter, setEmpStatusFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [allCohorts, setAllCohorts] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, { bookmarked: boolean; loading: boolean }>>({});

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then((data) => {
        // Filter to show alumni only
        const filtered = data.filter((p: Person) => p.type === "ALUMNI");
        setAlumni(filtered);
        // Extract all unique cohorts from fellowships
        const cohortSet = new Set<string>();
        filtered.forEach((p: any) => {
          if (p.fellowships && Array.isArray(p.fellowships)) {
            p.fellowships.forEach((f: any) => {
              if (f.cohort && f.cohort.name) cohortSet.add(f.cohort.name);
            });
          }
        });
        setAllCohorts(Array.from(cohortSet));
        setLoading(false);
      });
  }, []);

  // Fetch bookmark state for each alumni when session is ready
  useEffect(() => {
    if (!session || !session.user) return;
    const fetchBookmarks = async () => {
      const states: Record<string, { bookmarked: boolean; loading: boolean }> = {};
      await Promise.all(
        alumni.map(async (person) => {
          // Don't fetch for self
          if (session.user.id === person.id) {
            states[person.id] = { bookmarked: false, loading: false };
            return;
          }
          try {
            const res = await fetch(`/api/bookmarks/person?targetPersonId=${person.id}`);
            const data = await res.json();
            states[person.id] = { bookmarked: !!data.bookmarked, loading: false };
          } catch {
            states[person.id] = { bookmarked: false, loading: false };
          }
        })
      );
      setBookmarkStates(states);
    };
    if (alumni.length > 0) fetchBookmarks();
  }, [session, alumni]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Filtered alumni
  const filteredAlumni = alumni.filter((person: any) => {
    // Cohort filter
    if (cohortFilter) {
      const hasCohort = person.fellowships && person.fellowships.some((f: any) => f.cohort && f.cohort.name === cohortFilter);
      if (!hasCohort) return false;
    }
    // Employment status filter
    if (empStatusFilter && person.empStatus !== empStatusFilter) return false;
    // Name filter
    if (nameFilter && !(person.firstName + ' ' + person.lastName).toLowerCase().includes(nameFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Left: Label */}
          <div className="flex-1 flex items-center sm:justify-start justify-center">
            <div className="flex items-center">
              <span>
                <span className="sr-only">Community</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-base font-bold tracking-wide uppercase pointer-events-none">Community</Badge>
              </span>
            </div>
          </div>
          {/* Center: Filters */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white/80 border border-purple-100 rounded-xl shadow-sm px-4 py-3 flex flex-row items-center gap-3">
              <label className="mr-2 font-semibold text-purple-700">Cohort</label>
              <select
                className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                value={cohortFilter}
                onChange={e => setCohortFilter(e.target.value)}
              >
                <option value="">All</option>
                {allCohorts.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="ml-4 mr-2 font-semibold text-purple-700">Employment</label>
              <select
                className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                value={empStatusFilter}
                onChange={e => setEmpStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="EMPLOYED">Employed</option>
                <option value="SEEKING">Seeking</option>
                <option value="UNEMPLOYED">Unemployed</option>
              </select>
              <label className="ml-4 mr-2 font-semibold text-purple-700">Name</label>
              <input
                type="text"
                className="border border-purple-200 rounded px-2 py-1 focus:ring-2 focus:ring-purple-300 outline-none transition"
                placeholder="Search by name"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
              />
            </div>
          </div>
          {/* Right: (empty for now, for symmetry) */}
          <div className="flex-1 flex items-center sm:justify-end justify-center"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredAlumni.map((person) => {
            // Determine if current user is profile owner
            const isProfileOwner = session && session.user && session.user.id === person.id;
            const showBookmark = session && session.user && !isProfileOwner;
            const bookmarkState = bookmarkStates[person.id] || { bookmarked: false, loading: false };
            return (
              <div key={person.id} className="relative group">
                <Link href={`/alumni/${person.id}`} className="block">
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
                        {/* Bookmark Button (only for signed-in users who are not the profile owner) */}
                        {showBookmark && (
                          <button
                            aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                            disabled={bookmarkState.loading}
                            onClick={async (e) => {
                              e.preventDefault();
                              setBookmarkStates((prev) => ({
                                ...prev,
                                [person.id]: { ...prev[person.id], loading: true },
                              }));
                              try {
                                const res = await fetch("/api/bookmarks/person", {
                                  method: bookmarkState.bookmarked ? "DELETE" : "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ targetPersonId: person.id }),
                                });
                                if (res.ok) {
                                  setBookmarkStates((prev) => ({
                                    ...prev,
                                    [person.id]: { bookmarked: !bookmarkState.bookmarked, loading: false },
                                  }));
                                } else {
                                  setBookmarkStates((prev) => ({
                                    ...prev,
                                    [person.id]: { ...prev[person.id], loading: false },
                                  }));
                                }
                              } catch {
                                setBookmarkStates((prev) => ({
                                  ...prev,
                                  [person.id]: { ...prev[person.id], loading: false },
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
