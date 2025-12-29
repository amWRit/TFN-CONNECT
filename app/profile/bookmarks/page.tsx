
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfileImage } from "@/components/ProfileImage";

type Bookmark = {
  id: string;
  type: string;
  targetId: string;
  createdAt: string;
};

type BookmarksResponse = {
  people: Bookmark[];
  jobs: Bookmark[];
  posts: Bookmark[];
};

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<Record<string, Person>>({});

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/bookmarks/all");
        if (!res.ok) throw new Error("Failed to fetch bookmarks");
        const data = await res.json();
        setBookmarks(data);
        // Fetch person details for person bookmarks
        if (data.people && data.people.length > 0) {
          const ids = data.people.map((b: Bookmark) => b.targetId);
          const peopleRes = await fetch(`/api/people?ids=${ids.join(",")}`);
          if (peopleRes.ok) {
            const people: Person[] = await peopleRes.json();
            const map: Record<string, Person> = {};
            people.forEach((p) => { map[p.id] = p; });
            setPersonDetails(map);
          }
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">My Bookmarks</h1>
      {loading && <p className="text-center text-gray-500">Loading bookmarks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {bookmarks && (
        <div className="space-y-10">
          {Object.entries(bookmarks).map(([type, items]) => {
            // Assign a color scheme per type
            let border = "border-blue-400";
            if (type === "jobs") border = "border-green-400";
            if (type === "posts") border = "border-purple-400";
            if (type === "jobApplications") border = "border-yellow-400";
            return (
              <section
                key={type}
                className={`rounded-xl border-2 ${border} bg-blue-50 px-6 py-5 shadow-sm`}
              >
                <h2 className={`text-xl font-semibold mb-4 capitalize ${border} text-blue-700`}>{type.replace(/([A-Z])/g, ' $1')}</h2>
                {Array.isArray(items) && items.length > 0 ? (
                  <div className="grid gap-4">
                    {type === "people"
                      ? items.map((bm) => {
                          const person = personDetails[bm.targetId];
                          return (
                            <Card key={bm.id} className="flex items-center gap-4 p-4 hover:shadow-lg transition-shadow bg-white border-l-4 border-blue-300">
                              <CardHeader className="flex flex-row items-center gap-4 p-0 pr-4 bg-transparent">
                                {person ? (
                                  <ProfileImage
                                    src={person.profileImage}
                                    name={person.firstName + " " + person.lastName}
                                    className="h-12 w-12"
                                    alt={person.firstName + " " + person.lastName}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                                )}
                                <CardTitle className="text-lg font-semibold text-blue-700">
                                  {person ? (
                                    <Link href={`/profile?id=${person.id}`} className="hover:underline">
                                      {person.firstName} {person.lastName}
                                    </Link>
                                  ) : (
                                    <span>Person ID: {bm.targetId}</span>
                                  )}
                                </CardTitle>
                              </CardHeader>
                            </Card>
                          );
                        })
                      : items.map((bm) => (
                          <Card key={bm.id} className="p-4 bg-white border-l-4 border-blue-300">
                            <CardHeader className="p-0">
                              <CardTitle className="text-lg font-semibold text-blue-700">
                                {bm.type} - {bm.targetId}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No bookmarks in this category.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
