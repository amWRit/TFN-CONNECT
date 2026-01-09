"use client";


import { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NotFound from "@/components/NotFound";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone } from "lucide-react";
import { JobPostingCard } from "@/components/JobPostingCard";
import OpportunityCard from "@/components/OpportunityCard";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";
import { PostType } from "@prisma/client";

export default function ProfileActivityPage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const postTypeOptions = Object.entries(PostType).map(([key, value]) => ({ key, value }));
  const [selectedPostType, setSelectedPostType] = useState<string>("");
  // Opportunities filters
  const opportunityTypes = [
    "MENTORSHIP", "TRAINING", "GRANTS", "FELLOWSHIPS", "INTERNSHIPS", "JOBS", "COMPETITIONS", "COLLABORATION", "VOLUNTEERING", "NETWORKING", "FUNDING", "EVENTS", "ACCELERATORS", "EDUCATION"
  ];
  const [oppTypeFilter, setOppTypeFilter] = useState<string>("");
  const [oppStatusFilter, setOppStatusFilter] = useState<string>("");
  // Jobs filters
  const jobTypeOptions = ["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","VOLUNTEER","FREELANCE","TEMPORARY","REMOTE","HYBRID"];
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("");
  const [jobSkillsFilter, setJobSkillsFilter] = useState<{value:string;label:string}[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]); // All skills for mapping
  const allSkillsOptions = useMemo(() => skills.map((s:any) => ({ value: s.id, label: s.name })), [skills]);
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
        sessionRes = await fetch("/api/profile", { credentials: 'include' });
      } catch {}
      if (sessionRes && sessionRes.ok) {
        allow = true;
        sessionData = await sessionRes.json();
        setSessionUser(sessionData);
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
        const localAdmin = localStorage.getItem('adminAuth') === 'true';
        const sessionIsAdmin = !!(sessionData && sessionData.type === 'ADMIN');
        setIsAdmin(localAdmin || sessionIsAdmin);
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

  // Reset post type filter when leaving posts tab
  useEffect(() => {
    if (tab !== 'posts' && selectedPostType) {
      setSelectedPostType('');
    }
  }, [tab, selectedPostType]);

  // Reset opportunity filters when leaving opportunities tab
  useEffect(() => {
    if (tab !== 'opportunities') {
      if (oppTypeFilter) setOppTypeFilter('');
      if (oppStatusFilter) setOppStatusFilter('');
    }
    // also reset post filter when leaving posts (already added earlier)
  }, [tab]);

  // Reset jobs filters when leaving jobs tab
  useEffect(() => {
    if (tab !== 'jobs') {
      if (jobTypeFilter) setJobTypeFilter('');
      if (jobStatusFilter) setJobStatusFilter('');
      if (jobSkillsFilter.length) setJobSkillsFilter([]);
    }
  }, [tab]);

  // Memoized filtered opportunities for the profile
  const filteredOpps = useMemo(() => {
    const myOpps = opportunities.filter((opp: any) => opp.createdById === profile?.id);
    return myOpps.filter((opp: any) => {
      if (oppTypeFilter && (!Array.isArray(opp.types) || !opp.types.includes(oppTypeFilter))) return false;
      if (oppStatusFilter && opp.status !== oppStatusFilter) return false;
      return true;
    });
  }, [opportunities, profile, oppTypeFilter, oppStatusFilter]);

  // Memoized filtered jobs for the profile
  const filteredJobs = useMemo(() => {
    const myJobs = jobs.filter((job: any) => job.createdBy?.id === profile?.id);
    return myJobs.filter((job: any) => {
      if (jobTypeFilter && job.jobType !== jobTypeFilter) return false;
      if (jobStatusFilter && job.status !== jobStatusFilter) return false;
      if (jobSkillsFilter.length > 0) {
        const ids = jobSkillsFilter.map(s => s.value);
        if (!job.requiredSkills || !ids.every((id) => job.requiredSkills.includes(id))) return false;
      }
      return true;
    });
  }, [jobs, profile, jobTypeFilter, jobStatusFilter, jobSkillsFilter]);

  // Fetch bookmarks and details only when isProfileOwner is true
  useEffect(() => {
    // Only fetch bookmarks for the profile owner or a signed-in admin session
    // Wait until initial loading is complete so isAdmin/isProfileOwner are determined
    if (loading) return;
    if (!isProfileOwner && !isAdmin) return;
    setBmLoading(true);
    setBmError(null);
    async function fetchBookmarksAndDetails() {
      try {
        let bmUrl = "/api/bookmarks/all";
        let fetchOptions = {};
        // If signed-in admin is viewing someone else's profile, request their bookmarks
        if (isAdmin && !isProfileOwner && id) {
          bmUrl += `?personId=${encodeURIComponent(id)}`;
          // If bypass admin, send header
          if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
            fetchOptions = { headers: { 'x-admin-bypass': 'true' } };
          }
        }
        console.log("[BOOKMARKS FETCH] Fetching:", bmUrl, "isAdmin:", isAdmin, "isProfileOwner:", isProfileOwner, "id:", id, fetchOptions);
        const bmRes = await fetch(bmUrl, fetchOptions);
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
  }, [isProfileOwner, isAdmin, id, loading]);

  // Tab definitions
  const tabs = [
    { key: "jobs", label: "Jobs" },
    { key: "opportunities", label: "Opportunities" },
    { key: "posts", label: "Posts" },
    ...((isProfileOwner || isAdmin) ? [{ key: "bookmarks", label: "Bookmarks" }] : []),
  ];

  // Render activity content per tab
  function renderTabContent() {
    if (notFound) return <NotFound />;
    if (loading) return <div className="text-center text-gray-500">Loading activity...</div>;
    if (!profile) return <div className="text-center text-gray-500">Profile not found.</div>;
    if (tab === "jobs") {
      const skillIdToName = Object.fromEntries(skills.map((s: any) => [s.id, s.name]));
      return filteredJobs.length > 0
        ? filteredJobs.map((job: any) => {
            const skillNames = Array.isArray(job.requiredSkills)
              ? job.requiredSkills.map((id: string) => skillIdToName[id] || id)
              : [];
            return <JobPostingCard key={job.id} {...job} requiredSkills={skillNames} />;
          })
        : <div className="text-gray-500">No jobs found.</div>;
    }
    if (tab === "opportunities") {
      const list = filteredOpps;
      return list.length > 0 ? list.map((opp: any) => <OpportunityCard key={opp.id} {...opp} />) : <div className="text-gray-500">No opportunities found.</div>;
    }
    if (tab === "posts") {
      const myPosts = posts.filter((post: any) => post.person?.id === profile?.id);
      const filtered = selectedPostType ? myPosts.filter((p: any) => p.postType === selectedPostType) : myPosts;
      return filtered.length > 0
        ? filtered.map((post: any) => (
            <PostCard key={post.id} {...post} author={post.person} hideBookmark={isAdmin} />
          ))
        : <div className="text-gray-500">No posts found.</div>;
    }
    if (tab === "bookmarks" && (isProfileOwner || isAdmin)) {
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
      <div className="mb-4">  {/* reduced bottom margin */}
        {profile && (
          <div className="rounded-xl border-2 border-blue-400 bg-white shadow p-4 flex items-center gap-4"> {/* reduced padding and gap */}
            <ProfileImage src={profile.profileImage} name={profile.firstName + ' ' + profile.lastName} className="h-20 w-20" alt={profile.firstName + ' ' + profile.lastName} /> {/* smaller image */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {/* Name and person type on a single line */}
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-blue-700 truncate">{profile.firstName} {profile.lastName}</div>
                    {profile.type && (
                      <span className="flex items-center gap-2 ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                        <span className="text-sm">
                          {profile.type === 'ALUMNI' ? '⭐' : profile.type === 'STAFF' ? '👔' : profile.type === 'LEADERSHIP' ? '👑' : profile.type === 'ADMIN' ? '🛡️' : '👤'}
                        </span>
                        <span className="truncate">{String(profile.type).charAt(0) + String(profile.type).slice(1).toLowerCase()}</span>
                      </span>
                    )}
                  </div>
                  {/* Email and phone on the next line with icons */}
                  <div className="mt-1 flex items-center text-sm text-gray-600 truncate gap-4 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Mail className="text-gray-500" size={14} aria-hidden />
                      <span className="truncate">{profile.email1 || profile.email || 'No email provided'}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 truncate">
                        <Phone className="text-gray-500" size={14} aria-hidden />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Post Type Filter (shown only when Posts tab is active) */}
        {tab === 'posts' && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <label className="hidden sm:inline font-semibold text-blue-700">Type</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={selectedPostType}
                onChange={e => setSelectedPostType(e.target.value)}
              >
                <option value="">All</option>
                {postTypeOptions.map(opt => (
                  <option key={opt.key} value={opt.value}>{opt.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Jobs Filter (shown only when Jobs tab is active) - styled like Posts filter */}
        {tab === 'jobs' && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <label className="hidden sm:inline font-semibold text-blue-700">Type</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={jobTypeFilter}
                onChange={e => setJobTypeFilter(e.target.value)}
              >
                <option value="">All</option>
                {jobTypeOptions.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
              <label className="hidden sm:inline font-semibold text-blue-700">Status</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={jobStatusFilter}
                onChange={e => setJobStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="FILLED">Filled</option>
                <option value="CLOSED">Closed</option>
                <option value="PAUSED">Paused</option>
                <option value="DRAFT">Draft</option>
              </select>
              <div className="min-w-[220px]">
                <Select
                  isMulti
                  options={allSkillsOptions}
                  value={jobSkillsFilter}
                  onChange={(nv) => setJobSkillsFilter(Array.isArray(nv) ? [...nv] : [])}
                  classNamePrefix="react-select"
                  placeholder="Skills"
                  styles={{ menu: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minHeight: '32px', borderColor: '#bfdbfe', boxShadow: 'none' }) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Filter (shown only when Opportunities tab is active) - styled like Posts filter */}
        {tab === 'opportunities' && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <label className="hidden sm:inline font-semibold text-blue-700">Type</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={oppTypeFilter}
                onChange={e => setOppTypeFilter(e.target.value)}
              >
                <option value="">All</option>
                {opportunityTypes.map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <label className="hidden sm:inline font-semibold text-blue-700">Status</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={oppStatusFilter}
                onChange={e => setOppStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 min-h-[200px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
