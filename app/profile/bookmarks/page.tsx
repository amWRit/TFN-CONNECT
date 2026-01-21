"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ProfileImage } from "@/components/ProfileImage";

type Bookmark = {
  id: string;
  type: string;
  targetId: string;
  createdAt: string;
  title?: string;
  status?: string;
};

type BookmarksResponse = {
  people: Bookmark[];
  jobs: Bookmark[];
  jobApplications?: Bookmark[];
  posts: Bookmark[];
  opportunities?: Bookmark[];
  events?: Bookmark[];
};

type PostDetail = {
  id: string;
  content: string;
  postType: string;
  likes: number;
  createdAt: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  comments: Array<{ id: string }>;
};

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  type?: string; // PersonType
};

interface JobDetail {
  id: string;
  title: string;
  jobType: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<Record<string, Person>>({});
  const [jobDetails, setJobDetails] = useState<Record<string, JobDetail>>({});
  const [postDetails, setPostDetails] = useState<Record<string, PostDetail>>({});

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
        // Fetch job details for job bookmarks
        if (data.jobs && data.jobs.length > 0) {
          const jobIds = data.jobs.map((b: Bookmark) => b.targetId);
          const jobsRes = await fetch(`/api/jobs/details?ids=${jobIds.join(",")}`);
          if (jobsRes.ok) {
            const jobs: JobDetail[] = await jobsRes.json();
            const map: Record<string, JobDetail> = {};
            jobs.forEach((j) => { map[j.id] = j; });
            setJobDetails(map);
          }
        }
        // Fetch post details for post bookmarks
        if (data.posts && data.posts.length > 0) {
          const postIds = data.posts.map((b: Bookmark) => b.targetId);
          const postsRes = await fetch(`/api/feed`);
          if (postsRes.ok) {
            const posts: PostDetail[] = await postsRes.json();
            const map: Record<string, PostDetail> = {};
            posts.forEach((p) => { if (postIds.includes(p.id)) map[p.id] = p; });
            setPostDetails(map);
          }
        }
        // Fetch opportunity details for opportunity bookmarks
        if (data.opportunities && data.opportunities.length > 0) {
          const oppIds = data.opportunities.map((b: Bookmark) => b.targetId);
          const oppRes = await fetch(`/api/opportunities?ids=${oppIds.join(",")}`);
          if (oppRes.ok) {
            const opportunities: { id: string; title: string; status?: string }[] = await oppRes.json();
            setBookmarks((prev) => {
              if (!prev) return prev;
              const updated = (prev.opportunities ?? []).map((bm) => {
                const found = opportunities.find((o) => o.id === bm.targetId);
                return found ? { ...bm, title: found.title, status: found.status } : bm;
              });
              return { ...prev, opportunities: updated };
            });
          }
        }
        // Fetch event details for event bookmarks
        if (data.events && data.events.length > 0) {
          const eventIds = data.events.map((b: Bookmark) => b.targetId);
          const eventRes = await fetch(`/api/events?ids=${eventIds.join(",")}`);
          if (eventRes.ok) {
            const events: { id: string; title: string; status?: string }[] = await eventRes.json();
            setBookmarks((prev) => {
              if (!prev) return prev;
              const updated = (prev.events ?? []).map((bm) => {
                const found = events.find((e) => e.id === bm.targetId);
                return found ? { ...bm, title: found.title, status: found.status } : bm;
              });
              return { ...prev, events: updated };
            });
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

  // Delete bookmark handler
  async function handleDelete(bm: Bookmark, type: string) {
    let url = "/api/bookmarks/";
    let body: any = {};
    if (type === "people") {
      url += "person";
      body = { targetPersonId: bm.targetId };
    } else if (type === "jobs") {
      url += "job";
      body = { targetJobId: bm.targetId };
    } else {
      alert("Unbookmarking for this type is not implemented yet.");
      return;
    }
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setBookmarks((prev) => {
        if (!prev) return prev;
        const items = prev[type as keyof BookmarksResponse];
        if (!Array.isArray(items)) return prev;
        return {
          ...prev,
          [type]: items.filter((b) => b.id !== bm.id),
        };
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 sm:pb-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">My Bookmarks</h1>
      {loading && <p className="text-center text-gray-500">Loading bookmarks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {bookmarks && (
        <div className="space-y-3">
          {['people', 'jobs', 'posts', 'opportunities', 'events']
            .filter((type) => bookmarks[type as keyof BookmarksResponse])
            .map((type) => {
              const items = bookmarks[type as keyof BookmarksResponse] as Bookmark[];
              // Assign a color scheme per type
              let border = "border-blue-400", label = "text-blue-700";
              if (type === "jobs") { border = "border-green-400"; label = "text-green-700"; }
              if (type === "posts") { border = "border-purple-400"; label = "text-purple-700"; }
              if (type === "jobApplications") { border = "border-yellow-400"; label = "text-yellow-700"; }
              if (type === "opportunities") { border = "border-orange-400"; label = "text-orange-700"; }
              if (type === "events") { border = "border-emerald-400"; label = "text-emerald-700"; }
              return (
                <section
                  key={type}
                  className={`rounded-xl border-2 ${border} bg-blue-50 px-4 py-3 shadow-sm`}
                >
                  <h2 className={`text-xl font-semibold mb-2 capitalize ${border} ${label}`}>{type.replace(/([A-Z])/g, ' $1')}</h2>
                  {Array.isArray(items) && items.length > 0 ? (
                    <div className="grid gap-2">
                      {type === "people"
                        ? (
                            <div className="grid gap-2">
                              {items.map((bm) => {
                                const person = personDetails[bm.targetId];
                                return (
                                  <Card key={bm.id} className="flex items-center gap-3 p-3 hover:shadow transition-shadow bg-white border-l-4 border-blue-300 w-full min-w-0 max-w-full">
                                    <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full min-w-0 max-w-full">
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
                                      <CardTitle className="text-lg font-semibold text-blue-700 flex-1 flex flex-col items-start gap-1 w-full min-w-0 max-w-full truncate">
                                        {person ? (
                                          <>
                                            <Link href={`/profile?id=${person.id}`} className="hover:underline truncate w-full min-w-0 max-w-full block">
                                              <span className="truncate w-full min-w-0 max-w-full block">{person.firstName} {person.lastName}</span>
                                            </Link>
                                            {person.type && (
                                              <span className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-800 border border-blue-300 uppercase tracking-wide">
                                                {person.type}
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span>Person ID: {bm.targetId}</span>
                                        )}
                                      </CardTitle>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-100 ml-2"
                                        title="Remove bookmark"
                                        onClick={() => handleDelete(bm, type)}
                                      >
                                        <Trash2 />
                                      </Button>
                                    </CardHeader>
                                  </Card>
                                );
                              })}
                            </div>
                          )
                        : type === "posts"
                          ? items.map((bm) => {
                              const post = postDetails[bm.targetId];
                              return post ? (
                                <div key={bm.id} className="relative">
                                  <PostCard
                                    postId={post.id}
                                    author={post.person}
                                    content={post.content}
                                    postType={post.postType}
                                    likes={post.likes}
                                    comments={post.comments.length}
                                    createdAt={new Date(post.createdAt)}
                                    showEmojiBadge
                                    hideDate
                                    hideBookmark
                                    hideStats
                                    leftBorder
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100 absolute top-2 right-2 z-20"
                                    title="Remove bookmark"
                                    onClick={async () => {
                                      // Unbookmark post
                                      const res = await fetch('/api/bookmarks/post', {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ targetPostId: post.id }),
                                      });
                                      if (res.ok) {
                                        setBookmarks((prev) => {
                                          if (!prev) return prev;
                                          const items = prev['posts'];
                                          if (!Array.isArray(items)) return prev;
                                          return {
                                            ...prev,
                                            posts: items.filter((b) => b.id !== bm.id),
                                          };
                                        });
                                      } else {
                                        alert('Failed to remove bookmark.');
                                      }
                                    }}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              ) : (
                                <Card key={bm.id} className="p-4 bg-white border-l-4 border-purple-300 flex items-center">
                                  <CardHeader className="p-0 flex-1">
                                    <CardTitle className="text-lg font-semibold text-purple-700">
                                      <span>Post ID: {bm.targetId}</span>
                                    </CardTitle>
                                  </CardHeader>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100 ml-2"
                                    title="Remove bookmark"
                                    onClick={() => handleDelete(bm, type)}
                                  >
                                    <Trash2 />
                                  </Button>
                                </Card>
                              );
                            })
                          : type === "jobs"
                            ? (
                                <div className="grid gap-2">
                                  {items.map((bm) => {
                                    const job = jobDetails[bm.targetId];
                                    return (
                                      <Card key={bm.id} className="p-4 bg-white border-l-4 border-green-300 flex items-center w-full min-w-0 max-w-full">
                                        <CardHeader className="p-0 flex-1 w-full min-w-0 max-w-full">
                                          <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2 w-full min-w-0 max-w-full truncate">
                                            {job ? (
                                              <>
                                                <Link href={`/jobs/${job.id}`} className="hover:underline truncate w-full min-w-0 max-w-full block">
                                                  <span className="truncate w-full min-w-0 max-w-full block">{job.title}</span>
                                                </Link>
                                                <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase">
                                                  {job.jobType.replace(/_/g, ' ')}
                                                </span>
                                              </>
                                            ) : (
                                              <span>Job ID: {bm.targetId}</span>
                                            )}
                                          </CardTitle>
                                        </CardHeader>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:bg-red-100 ml-2"
                                          title="Remove bookmark"
                                          onClick={() => handleDelete(bm, type)}
                                        >
                                          <Trash2 />
                                        </Button>
                                      </Card>
                                    );
                                  })}
                                </div>
                              )
                            : type === "opportunities"
                              ? (
                                  <div className="grid gap-2">
                                    {items.map((bm) => (
                                      <Card key={bm.id} className="p-4 bg-white border-l-4 border-orange-300 flex items-center w-full min-w-0 max-w-full">
                                        <CardHeader className="p-0 flex-1 w-full min-w-0 max-w-full">
                                          <CardTitle className="text-lg font-semibold text-orange-700 flex items-center gap-2 w-full min-w-0 max-w-full truncate">
                                            <Link href={`/opportunities/${bm.targetId}`} className="hover:underline truncate w-full min-w-0 max-w-full block">
                                              <span className="truncate w-full min-w-0 max-w-full block">{bm.title || `Opportunity ID: ${bm.targetId}`}</span>
                                            </Link>
                                            {bm.status && (
                                              <span className="ml-2 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-semibold uppercase">
                                                {bm.status}
                                              </span>
                                            )}
                                          </CardTitle>
                                        </CardHeader>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:bg-red-100 ml-2"
                                          title="Remove bookmark"
                                          onClick={() => handleDelete(bm, type)}
                                        >
                                          <Trash2 />
                                        </Button>
                                      </Card>
                                    ))}
                                  </div>
                                )
                              : type === "events"
                                ? (
                                    <div className="grid gap-2">
                                      {items.map((bm) => (
                                        <Card key={bm.id} className="p-4 bg-white border-l-4 border-emerald-300 flex items-center w-full min-w-0 max-w-full">
                                          <CardHeader className="p-0 flex-1 w-full min-w-0 max-w-full">
                                            <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center gap-2 w-full min-w-0 max-w-full truncate">
                                              <Link href={`/events/${bm.targetId}`} className="hover:underline truncate w-full min-w-0 max-w-full block">
                                                <span className="truncate w-full min-w-0 max-w-full block">{bm.title || `Event ID: ${bm.targetId}`}</span>
                                              </Link>
                                              {bm.status && (
                                                <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase">
                                                  {bm.status}
                                                </span>
                                              )}
                                            </CardTitle>
                                          </CardHeader>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-100 ml-2"
                                            title="Remove bookmark"
                                            onClick={() => handleDelete(bm, type)}
                                          >
                                            <Trash2 />
                                          </Button>
                                        </Card>
                                      ))}
                                    </div>
                                  )
                                : null}
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
