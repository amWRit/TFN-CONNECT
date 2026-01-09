"use client";


import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NotFound from "@/components/NotFound";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { JobPostingCard } from "@/components/JobPostingCard";
import OpportunityCard from "@/components/OpportunityCard";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

export default function ProfileActivityPage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]); // All skills for mapping
  const [personDetails, setPersonDetails] = useState<Record<string, any>>({});
  const [jobDetails, setJobDetails] = useState<Record<string, any>>({});
  const [postDetails, setPostDetails] = useState<Record<string, any>>({});
  const [bmLoading, setBmLoading] = useState(false);
  const [bmError, setBmError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileAndActivity() {
      setLoading(true);
      // Check authentication: allow if NextAuth session OR admin localStorage
      let allow = false;
      let sessionData = null;
      let sessionRes;
      try {
        sessionRes = await fetch("/api/profile");
      } catch {}
      if (sessionRes && sessionRes.ok) {
        allow = true;
        sessionData = await sessionRes.json();
      } else if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
        allow = true;
      }
      if (!allow) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      // set local admin flag for UI (used to hide bookmark buttons for local admins)
      if (typeof window !== 'undefined') {
        setIsAdmin(localStorage.getItem('adminAuth') === 'true');
      }
      // Fetch all skills for mapping
      const skillsRes = await fetch('/api/skills');
      if (skillsRes.ok) setSkills(await skillsRes.json());
      // Fetch profile
      const res = await fetch(`/api/people/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Determine if viewing own profile (only for NextAuth session)
        if (sessionData && sessionData.id) {
          setIsProfileOwner(sessionData.id === data.id);
        }
      }
      // Fetch jobs
      const jobsRes = await fetch(`/api/jobs?personId=${id}`);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      // Fetch opportunities
      const oppRes = await fetch(`/api/opportunities?personId=${id}`);
      if (oppRes.ok) setOpportunities(await oppRes.json());
      // Fetch posts
      const postsRes = await fetch(`/api/feed?personId=${id}`);
      if (postsRes.ok) setPosts(await postsRes.json());
      setLoading(false);
    }
    fetchProfileAndActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch bookmarks and details only when isProfileOwner is true
  useEffect(() => {
    if (!isProfileOwner) return;
    setBmLoading(true);
    setBmError(null);
    async function fetchBookmarksAndDetails() {
      try {
        const bmRes = await fetch("/api/bookmarks/all");
        if (bmRes.ok) {
          const data = await bmRes.json();
          setBookmarks(data);
          // Fetch person details for person bookmarks
          if (data.people && data.people.length > 0) {
            const ids = data.people.map((b: any) => b.targetId);
            const peopleRes = await fetch(`/api/people?ids=${ids.join(",")}`);
            if (peopleRes.ok) {
              const people = await peopleRes.json();
              const map: Record<string, any> = {};
              people.forEach((p: any) => { map[p.id] = p; });
              setPersonDetails(map);
            }
          }
          // Fetch job details for job bookmarks
          if (data.jobs && data.jobs.length > 0) {
            const jobIds = data.jobs.map((b: any) => b.targetId);
            const jobsRes = await fetch(`/api/jobs/details?ids=${jobIds.join(",")}`);
            if (jobsRes.ok) {
              const jobs = await jobsRes.json();
              const map: Record<string, any> = {};
              jobs.forEach((j: any) => { map[j.id] = j; });
              setJobDetails(map);
            }
          }
          // Fetch post details for post bookmarks
          if (data.posts && data.posts.length > 0) {
            const postIds = data.posts.map((b: any) => b.targetId);
            const postsRes = await fetch(`/api/feed`);
            if (postsRes.ok) {
              const posts = await postsRes.json();
              const map: Record<string, any> = {};
              posts.forEach((p: any) => { if (postIds.includes(p.id)) map[p.id] = p; });
              setPostDetails(map);
            }
          }
        }
      } catch (err: any) {
        setBmError(err.message || "Unknown error");
      } finally {
        setBmLoading(false);
      }
    }
    fetchBookmarksAndDetails();
  }, [isProfileOwner]);

  // Tab definitions
  const tabs = [
    { key: "jobs", label: "Jobs" },
    { key: "opportunities", label: "Opportunities" },
    { key: "posts", label: "Posts" },
    ...(isProfileOwner ? [{ key: "bookmarks", label: "Bookmarks" }] : []),
  ];

  // Render activity content per tab
  function renderTabContent() {
    if (notFound) return <NotFound />;
    if (loading) return <div className="text-center text-gray-500">Loading activity...</div>;
    if (!profile) return <div className="text-center text-gray-500">Profile not found.</div>;
    if (tab === "jobs") {
      const myJobs = jobs.filter((job: any) => job.createdBy?.id === profile?.id);
      // Map requiredSkills IDs to names for each job
      const skillIdToName = Object.fromEntries(skills.map((s: any) => [s.id, s.name]));
      return myJobs.length > 0
        ? myJobs.map((job: any) => {
            const skillNames = Array.isArray(job.requiredSkills)
              ? job.requiredSkills.map((id: string) => skillIdToName[id] || id)
              : [];
            return <JobPostingCard key={job.id} {...job} requiredSkills={skillNames} />;
          })
        : <div className="text-gray-500">No jobs found.</div>;
    }
    if (tab === "opportunities") {
      const myOpps = opportunities.filter((opp: any) => opp.createdById === profile?.id);
      return myOpps.length > 0 ? myOpps.map((opp: any) => <OpportunityCard key={opp.id} {...opp} />) : <div className="text-gray-500">No opportunities found.</div>;
    }
    if (tab === "posts") {
      const myPosts = posts.filter((post: any) => post.person?.id === profile?.id);
      return myPosts.length > 0
        ? myPosts.map((post: any) => (
            <PostCard key={post.id} {...post} author={post.person} hideBookmark={isAdmin} />
          ))
        : <div className="text-gray-500">No posts found.</div>;
    }
    if (tab === "bookmarks" && isProfileOwner) {
      if (bmLoading) return <div className="text-center text-gray-500">Loading bookmarks...</div>;
      if (bmError) return <div className="text-center text-red-500">{bmError}</div>;
      return bookmarks && Object.keys(bookmarks).length > 0 ? (
        <div className="space-y-10">
          {['people', 'jobs', 'posts'].filter(type => bookmarks[type]?.length > 0).map(type => {
            const items = bookmarks[type];
            let border = "border-blue-400", label = "text-blue-700";
            if (type === "jobs") { border = "border-green-400"; label = "text-green-700"; }
            if (type === "posts") { border = "border-purple-400"; label = "text-purple-700"; }
            return (
              <section key={type} className={`rounded-xl border-2 ${border} bg-blue-50 px-6 py-5 shadow-sm`}>
                <h2 className={`text-xl font-semibold mb-4 capitalize ${border} ${label}`}>{type.replace(/([A-Z])/g, ' $1')}</h2>
                {Array.isArray(items) && items.length > 0 ? (
                  <div className="grid gap-4">
                    {type === "people"
                      ? items.map((bm: any) => {
                          const person = personDetails[bm.targetId];
                          return (
                            <Card key={bm.id} className="flex items-center gap-4 p-4 hover:shadow-lg transition-shadow bg-white border-l-4 border-blue-300">
                              <CardHeader className="flex flex-row items-center gap-4 p-0 pr-4 bg-transparent w-full">
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
                                <CardTitle className="text-lg font-semibold text-blue-700 flex-1 flex items-center gap-2">
                                  {person ? (
                                    <>
                                      <Link href={`/profile?id=${person.id}`} className="hover:underline">
                                        {person.firstName} {person.lastName}
                                      </Link>
                                      {person.type && (
                                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-800 border border-blue-300 uppercase tracking-wide">
                                          {person.type}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span>Person ID: {bm.targetId}</span>
                                  )}
                                </CardTitle>
                              </CardHeader>
                            </Card>
                          );
                        })
                      : type === "posts"
                        ? items.map((bm: any) => {
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
                              </div>
                            ) : (
                              <Card key={bm.id} className="p-4 bg-white border-l-4 border-purple-300 flex items-center">
                                <CardHeader className="p-0 flex-1">
                                  <CardTitle className="text-lg font-semibold text-purple-700">
                                    <span>Post ID: {bm.targetId}</span>
                                  </CardTitle>
                                </CardHeader>
                              </Card>
                            );
                          })
                        : items.map((bm: any) => {
                            const job = jobDetails[bm.targetId];
                            return (
                              <Card key={bm.id} className="p-4 bg-white border-l-4 border-green-300 flex items-center">
                                <CardHeader className="p-0 flex-1">
                                  <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
                                    {job ? (
                                      <>
                                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                                          {job.title}
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
                              </Card>
                            );
                          })}
                  </div>
                ) : (
                  <p className="text-gray-500">No bookmarks in this category.</p>
                )}
              </section>
            );
          })}
        </div>
      ) : <div className="text-gray-500">No bookmarks found.</div>;
    }
    return <div className="text-gray-500">No activity found.</div>;
  }

  if (notFound) return <NotFound />;
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <div className="mb-8">
        {profile && (
          <div className="rounded-xl border-2 border-blue-400 bg-white shadow p-6 flex flex-col sm:flex-row items-center gap-6">
            <ProfileImage src={profile.profileImage} name={profile.firstName + ' ' + profile.lastName} className="h-24 w-24" alt={profile.firstName + ' ' + profile.lastName} />
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-700 mb-1">{profile.firstName} {profile.lastName}</div>
              <div className="text-sm text-gray-600 mb-2">{profile.email1}</div>
              <div className="flex gap-2 items-center">
                {profile.type && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: profile.type === 'ALUMNI' ? '#fee2e2' : profile.type === 'STAFF' ? '#dbeafe' : '#fef9c3', color: profile.type === 'ALUMNI' ? '#b91c1c' : profile.type === 'STAFF' ? '#1d4ed8' : '#b45309' }}>{profile.type}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Activity Tabs */}
      <div>
        <div className="flex gap-4 border-b mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 font-semibold ${tab === t.key ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-700'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6 min-h-[200px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
