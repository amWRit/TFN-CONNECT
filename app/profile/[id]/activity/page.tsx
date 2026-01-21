"use client";


import { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NotFound from "@/components/NotFound";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Phone, Briefcase, Rocket, MessageSquare, Bookmark as BookmarkIcon, Heart, Users, Calendar, Filter } from "lucide-react";
import { JobPostingCard } from "@/components/JobPostingCard";
import OpportunityCard from "@/components/OpportunityCard";
import { PostCard } from "@/components/PostCard";
import { EditPostModal } from "@/components/EditPostModal";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import { PostType } from "@prisma/client";

const TYPE_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  FELLOW:  { bg: "bg-purple-100",   text: "text-purple-700",   icon: "🎓", label: "Fellow" },
  ALUMNI:   { bg: "bg-red-100",      text: "text-red-700",      icon: "⭐",  label: "Alumni" },
  STAFF:    { bg: "bg-blue-100",     text: "text-blue-700",     icon: "👔", label: "Staff" },
  LEADERSHIP: { bg: "bg-yellow-100", text: "text-yellow-800",   icon: "👑", label: "Leadership" },
  ADMIN:    { bg: "bg-green-100",    text: "text-green-700",    icon: "🛡️", label: "Admin" },
};

export default function ProfileActivityPage() {
  // Collapsible filter state for small screens (for jobs and opportunities tabs)
  const [showFilters, setShowFilters] = useState(false);
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
  const [events, setEvents] = useState<any[]>([]);
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
  const [interestGroups, setInterestGroups] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]); // All skills for mapping
  const allSkillsOptions = useMemo(() => skills.map((s:any) => ({ value: s.id, label: s.name })), [skills]);
  const [personDetails, setPersonDetails] = useState<Record<string, any>>({});
  const [jobDetails, setJobDetails] = useState<Record<string, any>>({});
  const [postDetails, setPostDetails] = useState<Record<string, any>>({});
  const [opportunityDetails, setOpportunityDetails] = useState<Record<string, any>>({});
  const [eventDetails, setEventDetails] = useState<Record<string, any>>({});
  const [bmLoading, setBmLoading] = useState(false);
  const [bmError, setBmError] = useState<string | null>(null);
  const [intLoading, setIntLoading] = useState(false);
  const [intError, setIntError] = useState<string | null>(null);
  const [interestJobDetails, setInterestJobDetails] = useState<Record<string, any>>({});
  const [interestOppDetails, setInterestOppDetails] = useState<Record<string, any>>({});
  const [interestEventDetails, setInterestEventDetails] = useState<Record<string, any>>({});
  // Post edit modal state (reuse logic from feed page)
  const [editPost, setEditPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPostType, setEditPostType] = useState("GENERAL");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editAction, setEditAction] = useState<"save" | "delete" | null>(null);

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
      // Fetch events
      const eventsRes = await fetch(`/api/events?personId=${id}`);
      if (eventsRes.ok) setEvents(await eventsRes.json());
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
        // Always include credentials and headers as needed
        let fetchOptions: RequestInit = { credentials: 'include', headers: {} };
        // If signed-in admin is viewing someone else's profile, request their bookmarks
        if (isAdmin && !isProfileOwner && id) {
          bmUrl += `?personId=${encodeURIComponent(id)}`;
          // If bypass admin, send header
          if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
            (fetchOptions.headers as Record<string, string>)['x-admin-bypass'] = 'true';
          }
        }
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
          // Fetch opportunity details for opportunity bookmarks
          if (data.opportunities && data.opportunities.length > 0) {
            const oppIds: string[] = Array.from(new Set(data.opportunities.map((b: any) => b.targetId)));
            try {
              const results = await Promise.all(
                oppIds.map(async (oid) => {
                  const res = await fetch(`/api/opportunities/${oid}`);
                  if (!res.ok) return null;
                  const opp = await res.json();
                  return opp && opp.id ? opp : null;
                })
              );
              const map: Record<string, any> = {};
              results.forEach((opp) => {
                if (opp && opp.id) map[opp.id] = opp;
              });
              setOpportunityDetails(map);
            } catch (e) {
              // swallow errors here; bookmarks UI will fall back to IDs
            }
          }
          // Fetch event details for event bookmarks
          if (data.events && data.events.length > 0) {
            const eventIds: string[] = Array.from(new Set(data.events.map((b: any) => b.targetId)));
            try {
              const results = await Promise.all(
                eventIds.map(async (eid) => {
                  const res = await fetch(`/api/events/${eid}`);
                  if (!res.ok) return null;
                  const evt = await res.json();
                  return evt && evt.id ? evt : null;
                })
              );
              const map: Record<string, any> = {};
              results.forEach((evt) => {
                if (evt && evt.id) map[evt.id] = evt;
              });
              setEventDetails(map);
            } catch (e) {
              // swallow errors here; bookmarks UI will fall back to IDs
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

  // Fetch interests and related job/opportunity details when profile owner or admin
  useEffect(() => {
    if (loading) return;
    if (!isProfileOwner && !isAdmin) return;
    setIntLoading(true);
    setIntError(null);
    async function fetchInterestsAndDetails() {
      try {
        let intUrl = "/api/interests/all";
        let fetchOptions: any = {};
        if (isAdmin && !isProfileOwner && id) {
          intUrl += `?personId=${encodeURIComponent(id)}`;
          if (typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true") {
            fetchOptions = { headers: { "x-admin-bypass": "true" } };
          }
        }
        const intRes = await fetch(intUrl, fetchOptions);
        if (intRes.ok) {
          const data = await intRes.json();
          setInterestGroups(data || {});
          // Fetch job details for interested jobs
          if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
            const jobIds: string[] = Array.from(new Set(data.jobs.map((i: any) => i.targetId)));
            const jobsRes = await fetch(`/api/jobs/details?ids=${jobIds.join(",")}`);
            if (jobsRes.ok) {
              const jobs = await jobsRes.json();
              const map: Record<string, any> = {};
              jobs.forEach((j: any) => {
                map[j.id] = j;
              });
              setInterestJobDetails(map);
            } else {
              setInterestJobDetails({});
            }
          } else {
            setInterestJobDetails({});
          }
          // Fetch opportunity details for interested opportunities
          if (data.opportunities && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
            const oppIds: string[] = Array.from(new Set(data.opportunities.map((i: any) => i.targetId)));
            try {
              const results = await Promise.all(
                oppIds.map(async (oid) => {
                  const res = await fetch(`/api/opportunities/${oid}`);
                  if (!res.ok) return null;
                  const opp = await res.json();
                  return opp && opp.id ? opp : null;
                })
              );
              const map: Record<string, any> = {};
              results.forEach((opp) => {
                if (opp && opp.id) map[opp.id] = opp;
              });
              setInterestOppDetails(map);
            } catch {
              setInterestOppDetails({});
            }
          } else {
            setInterestOppDetails({});
          }
          // Fetch event details for interested events
          if (data.events && Array.isArray(data.events) && data.events.length > 0) {
            const eventIds: string[] = Array.from(new Set(data.events.map((i: any) => i.targetId)));
            try {
              const results = await Promise.all(
                eventIds.map(async (eid) => {
                  const res = await fetch(`/api/events/${eid}`);
                  if (!res.ok) return null;
                  const evt = await res.json();
                  return evt && evt.id ? evt : null;
                })
              );
              const map: Record<string, any> = {};
              results.forEach((evt) => {
                if (evt && evt.id) map[evt.id] = evt;
              });
              setInterestEventDetails(map);
            } catch {
              setInterestEventDetails({});
            }
          } else {
            setInterestEventDetails({});
          }
        } else {
          setIntError("Failed to load interests");
        }
      } catch (err: any) {
        setIntError(err.message || "Unknown error");
      } finally {
        setIntLoading(false);
      }
    }
    fetchInterestsAndDetails();
  }, [isProfileOwner, isAdmin, id, loading]);

  // Tab definitions
  const tabs = [
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "opportunities", label: "Opportunities", icon: Rocket },
    { key: "events", label: "Events", icon: Calendar },
    { key: "posts", label: "Posts", icon: MessageSquare },
    ...((isProfileOwner || isAdmin)
      ? [
          { key: "bookmarks", label: "Bookmarks", icon: BookmarkIcon },
          { key: "interests", label: "Interests", icon: Heart },
        ]
      : []),
  ];

  // Handlers for editing posts (similar to feed page)
  const handleEdit = (post: any) => {
    setEditPost(post);
    setEditContent(post.content);
    setEditPostType(post.postType);
    setEditError("");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPost) return;
    setEditAction("save");
    setEditSubmitting(true);
    setEditError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
        headers['x-admin-auth'] = 'true';
      }
      const res = await fetch(`/api/feed/${editPost.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ content: editContent, postType: editPostType }),
      });
      if (!res.ok) throw new Error("Failed to update post");
      setEditPost(null);
      // Refresh posts for this profile
      try {
        const refreshed = await fetch(`/api/feed?personId=${id}`);
        if (refreshed.ok) {
          const data = await refreshed.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch {}
    } catch (err: any) {
      setEditError(err.message || "Failed to update post");
    } finally {
      setEditSubmitting(false);
      setEditAction(null);
    }
  };

  const handleEditDelete = async () => {
    if (!editPost) return;
    setEditAction("delete");
    setEditSubmitting(true);
    setEditError("");
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
        headers['x-admin-auth'] = 'true';
      }
      const res = await fetch(`/api/feed/${editPost.id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete post");
      setEditPost(null);
      // Refresh posts for this profile
      try {
        const refreshed = await fetch(`/api/feed?personId=${id}`);
        if (refreshed.ok) {
          const data = await refreshed.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch {}
    } catch (err: any) {
      setEditError(err.message || "Failed to delete post");
    } finally {
      setEditSubmitting(false);
      setEditAction(null);
    }
  };

  // Render activity content per tab
  function renderTabContent() {
    if (notFound) return <NotFound />;
    if (loading) return <div className="text-center text-gray-500">Loading activity...</div>;
    if (!profile) return <div className="text-center text-gray-500">Profile not found.</div>;
    if (tab === "jobs") {
      const skillIdToName = Object.fromEntries(skills.map((s: any) => [s.id, s.name]));
      return filteredJobs.length > 0
        ? (
            <div className="flex flex-col gap-3">
              {filteredJobs.map((job: any) => {
                const skillNames = Array.isArray(job.requiredSkills)
                  ? job.requiredSkills.map((id: string) => skillIdToName[id] || id)
                  : [];
                return <JobPostingCard key={job.id} {...job} requiredSkills={skillNames} adminView={isAdmin} showOverviewOnly href={`/jobs/${job.id}`} />;
              })}
            </div>
          )
        : <div className="text-gray-500">No jobs found.</div>;
    }
    if (tab === "opportunities") {
      const list = filteredOpps;
      return list.length > 0
        ? (
            <div className="flex flex-col gap-3">
              {list.map((opp: any) => (
                <OpportunityCard key={opp.id} {...opp} adminView={isAdmin} showOverviewOnly />
              ))}
            </div>
          )
        : <div className="text-gray-500">No opportunities found.</div>;
    }
    if (tab === "events") {
      const myEvents = events.filter((evt: any) => evt.createdById === profile?.id);
      return myEvents.length > 0
        ? (
            <div className="flex flex-col gap-3">
              {myEvents.map((evt: any) => (
                <EventCard
                  key={evt.id}
                  {...evt}
                  adminView={isAdmin}
                  showOverviewOnly
                />
              ))}
            </div>
          )
        : <div className="text-gray-500">No events found.</div>;
    }
    if (tab === "posts") {
      const myPosts = posts.filter((post: any) => post.person?.id === profile?.id);
      const filtered = selectedPostType ? myPosts.filter((p: any) => p.postType === selectedPostType) : myPosts;
      return filtered.length > 0
        ? (
            <div className="flex flex-col gap-3">
              {filtered.map((post: any) => (
                <PostCard
                  key={post.id}
                  {...post}
                  author={post.person}
                  hideBookmark={false}
                  hideStats
                  onEdit={() => handleEdit(post)}
                />
              ))}
            </div>
          )
        : <div className="text-gray-500">No posts found.</div>;
    }
    if (tab === "bookmarks" && (isProfileOwner || isAdmin)) {
      if (bmLoading) return <div className="text-center text-gray-500">Loading bookmarks...</div>;
      if (bmError) return <div className="text-center text-red-500">{bmError}</div>;
      return bookmarks && Object.keys(bookmarks).length > 0 ? (
        <div className="space-y-6">
          {(["people", "jobs", "opportunities", "events", "posts"] as const).filter(type => (bookmarks as any)[type]?.length > 0).map(type => {
            const items = (bookmarks as any)[type];
            let border = "border-blue-400", label = "text-blue-700";
            if (type === "jobs") { border = "border-green-400"; label = "text-green-700"; }
            if (type === "posts") { border = "border-purple-400"; label = "text-purple-700"; }
            if (type === "opportunities") { border = "border-orange-400"; label = "text-orange-700"; }
            if (type === "events") { border = "border-emerald-400"; label = "text-emerald-700"; }
            let IconComp: React.ComponentType<any> | null = null;
            let headingText = "";
            if (type === "people") {
              IconComp = Users;
              headingText = "People";
            } else if (type === "jobs") {
              IconComp = Briefcase;
              headingText = "Jobs";
            } else if (type === "posts") {
              IconComp = MessageSquare;
              headingText = "Posts";
            } else if (type === "opportunities") {
              IconComp = Rocket;
              headingText = "Opportunities";
            } else if (type === "events") {
              IconComp = Calendar;
              headingText = "Events";
            }
            return (
              <section key={type} className={`rounded-xl border-2 ${border} bg-blue-50 px-4 py-4 shadow-sm`}>
                <h2 className={`text-lg font-semibold mb-3 capitalize flex items-center gap-2 ${border} ${label}`}>
                  {IconComp && <IconComp className="w-5 h-5" aria-hidden />}
                  <span>{headingText || type.replace(/([A-Z])/g, ' $1')}</span>
                </h2>
                {Array.isArray(items) && items.length > 0 ? (
                  <div className="flex flex-col gap-3 w-full max-w-full overflow-x-visible">
                    {type === "people"
                      ? items.map((bm) => {
                          const person = personDetails[bm.targetId];
                          return (
                            <Card key={bm.id} className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-blue-300">
                              <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
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
                                <CardTitle className="text-lg font-semibold text-blue-700 flex-1 flex items-center gap-2 truncate max-w-[70vw] sm:max-w-full">
                                  {person ? (
                                    <>
                                      <Link href={`/profile?id=${person.id}`} className="hover:underline truncate max-w-[50vw] sm:max-w-full block">
                                        <span className="truncate">{person.firstName} {person.lastName}</span>
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
                                {isProfileOwner && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100 ml-2"
                                    title="Remove bookmark"
                                    onClick={() => handleDelete(bm, type)}
                                  >
                                    <Trash2 />
                                  </Button>
                                )}
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
                                {isProfileOwner && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100 absolute top-2 right-2 z-20"
                                    title="Remove bookmark"
                                    onClick={() => handleDelete(bm, type)}
                                  >
                                    <Trash2 />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Card key={bm.id} className="p-3 bg-white border-l-4 border-purple-300 flex items-center">
                                <CardHeader className="p-0 flex-1">
                                  <CardTitle className="text-lg font-semibold text-purple-700">
                                    <span>Post ID: {bm.targetId}</span>
                                  </CardTitle>
                                </CardHeader>
                                {isProfileOwner && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-100 ml-2"
                                    title="Remove bookmark"
                                    onClick={() => handleDelete(bm, type)}
                                  >
                                    <Trash2 />
                                  </Button>
                                )}
                              </Card>
                            );
                          })
                        : type === "jobs"
                          ? items.map((bm: any) => {
                              const job = jobDetails[bm.targetId];
                              return (
                                <Card key={bm.id} className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-green-300">
                                  <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                    <CardTitle className="text-lg font-semibold text-green-700 flex-1 flex flex-col items-start gap-1">
                                      {job ? (
                                        <>
                                          <Link href={`/jobs/${job.id}`} className="hover:underline">
                                            {job.title}
                                          </Link>
                                          <div className="mt-1">
                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase">
                                              {job.jobType.replace(/_/g, ' ')}
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <span>Job ID: {bm.targetId}</span>
                                      )}
                                    </CardTitle>
                                    {isProfileOwner && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-100 ml-2 self-start"
                                        title="Remove bookmark"
                                        onClick={() => handleDelete(bm, type)}
                                      >
                                        <Trash2 />
                                      </Button>
                                    )}
                                  </CardHeader>
                                </Card>
                              );
                            })
                          : type === "opportunities"
                            ? items.map((bm: any) => {
                                const opp = opportunityDetails[bm.targetId];
                                return (
                                  <Card key={bm.id} className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-orange-300">
                                    <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                      <CardTitle className="text-lg font-semibold text-orange-700 flex-1 flex flex-col items-start gap-1">
                                        {opp ? (
                                          <>
                                            <Link href={`/opportunities/${opp.id}`} className="hover:underline">
                                              {opp.title || "Untitled Opportunity"}
                                            </Link>
                                            {opp.status && (
                                              <div className="mt-1">
                                                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-semibold uppercase">
                                                  {opp.status}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <span>Opportunity ID: {bm.targetId}</span>
                                        )}
                                      </CardTitle>
                                      {(isProfileOwner || isAdmin) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:bg-red-100 ml-2 self-start"
                                          title="Remove bookmark"
                                          onClick={() => handleDelete(bm, type)}
                                        >
                                          <Trash2 />
                                        </Button>
                                      )}
                                    </CardHeader>
                                  </Card>
                                );
                              })
                            : items.map((bm: any) => {
                                const evt = eventDetails[bm.targetId];
                                return (
                                  <Card key={bm.id} className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-emerald-300 max-w-full">
                                    <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                      <CardTitle className="text-lg font-semibold text-emerald-700 flex-1 flex flex-col items-start gap-1 break-words max-w-full">
                                        {evt ? (
                                          <>
                                            <Link href={`/events/${evt.id}`} className="hover:underline break-words max-w-full">
                                              {evt.title || "Untitled Event"}
                                            </Link>
                                            {evt.status && (
                                              <div className="mt-1">
                                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase">
                                                  {evt.status}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="flex overflow-hidden w-full">
                                            <span className="truncate block max-w-[50vw] sm:max-w-full" title={"Event ID: " + bm.targetId}>Event ID: {bm.targetId}</span>
                                          </div>
                                        )}
                                      </CardTitle>
                                      {(isProfileOwner || isAdmin) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:bg-red-100 ml-2"
                                          title="Remove bookmark"
                                          onClick={() => handleDelete(bm, type)}
                                        >
                                          <Trash2 />
                                        </Button>
                                      )}
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
    if (tab === "interests" && (isProfileOwner || isAdmin)) {
      if (intLoading) return <div className="text-center text-gray-500">Loading interests...</div>;
      if (intError) return <div className="text-center text-red-500">{intError}</div>;
      return interestGroups && (interestGroups.jobs?.length || interestGroups.opportunities?.length || interestGroups.events?.length) ? (
        <div className="space-y-6">
          {(["jobs", "opportunities", "events"] as const)
            .filter((type) => (interestGroups as any)[type]?.length > 0)
            .map((type) => {
              const items = (interestGroups as any)[type];
              let border = "border-green-400";
              let label = "text-green-700";
              if (type === "opportunities") {
                border = "border-orange-400";
                label = "text-orange-700";
              } else if (type === "events") {
                border = "border-emerald-400";
                label = "text-emerald-700";
              }
              let IconComp: React.ComponentType<any> | null = null;
              let headingText = "";
              if (type === "jobs") {
                IconComp = Briefcase;
                headingText = "Jobs";
              } else if (type === "opportunities") {
                IconComp = Rocket;
                headingText = "Opportunities";
              } else if (type === "events") {
                IconComp = Calendar;
                headingText = "Events";
              }
              return (
                <section
                  key={type}
                  className={`rounded-xl border-2 ${border} bg-blue-50 px-4 py-4 shadow-sm`}
                >
                  <h2 className={`text-lg font-semibold mb-3 capitalize flex items-center gap-2 ${border} ${label}`}>
                    {IconComp && <IconComp className="w-5 h-5" aria-hidden />}
                    <span>{headingText || (type === "jobs" ? "Jobs" : "Opportunities")}</span>
                  </h2>
                  {Array.isArray(items) && items.length > 0 ? (
                    <div className="grid gap-3">
                      {type === "jobs"
                        ? items.map((interest: any) => {
                            const job = interestJobDetails[interest.targetId];
                            return (
                              <Card
                                key={interest.id}
                                className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-green-300"
                              >
                                <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                    <CardTitle className="text-lg font-semibold text-green-700 flex-1 flex flex-col items-start gap-1 truncate max-w-[70vw] sm:max-w-full">
                                      {job ? (
                                        <>
                                          <Link href={`/jobs/${job.id}`} className="hover:underline truncate max-w-[50vw] sm:max-w-full block">
                                            <span className="truncate max-w-[50vw] sm:max-w-full block">{job.title}</span>
                                          </Link>
                                          <div className="mt-1">
                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase">
                                              {job.jobType.replace(/_/g, " ")}
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <span className="truncate max-w-[50vw] sm:max-w-full block" title={"Job ID: " + interest.targetId}>Job ID: {interest.targetId}</span>
                                      )}
                                    </CardTitle>
                                  {isProfileOwner && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:bg-red-100 ml-2 self-start"
                                      title="Remove interest"
                                      onClick={() => handleInterestDelete(interest, type)}
                                    >
                                      <Trash2 />
                                    </Button>
                                  )}
                                </CardHeader>
                              </Card>
                            );
                          })
                        : type === "opportunities"
                          ? items.map((interest: any) => {
                              const opp = interestOppDetails[interest.targetId];
                              return (
                                <Card
                                  key={interest.id}
                                  className="flex items-center gap-3 p-3 hover:shadow bg-white border-l-4 border-orange-300"
                                >
                                  <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                    <CardTitle className="text-lg font-semibold text-orange-700 flex-1 flex flex-col items-start gap-1 truncate max-w-[70vw] sm:max-w-full">
                                      {opp ? (
                                        <>
                                          <Link
                                            href={`/opportunities/${opp.id}`}
                                            className="hover:underline truncate max-w-[50vw] sm:max-w-full block"
                                          >
                                            <span className="truncate max-w-[50vw] sm:max-w-full block">{opp.title || "Untitled Opportunity"}</span>
                                          </Link>
                                          {opp.status && (
                                            <div className="mt-1">
                                              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-semibold uppercase">
                                                {opp.status}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <span className="truncate max-w-[50vw] sm:max-w-full block" title={"Opportunity ID: " + interest.targetId}>Opportunity ID: {interest.targetId}</span>
                                      )}
                                    </CardTitle>
                                    {isProfileOwner && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-100 ml-2 self-start"
                                        title="Remove interest"
                                        onClick={() => handleInterestDelete(interest, type)}
                                      >
                                        <Trash2 />
                                      </Button>
                                    )}
                                  </CardHeader>
                                </Card>
                              );
                            })
                          : items.map((interest: any) => {
                              const evt = interestEventDetails[interest.targetId];
                              return (
                                <Card
                                  key={interest.id}
                                  className="flex flex-col gap-1 p-3 hover:shadow bg-white border-l-4 border-emerald-300"
                                >
                                  <CardHeader className="flex flex-row items-center gap-3 p-0 pr-3 bg-transparent w-full">
                                    <CardTitle className="text-lg font-semibold text-emerald-700 flex-1 flex flex-col items-start gap-1 truncate max-w-[70vw] sm:max-w-full">
                                      {evt ? (
                                        <>
                                          <Link href={`/events/${evt.id}`} className="hover:underline truncate max-w-[50vw] sm:max-w-full block">
                                            <span className="truncate max-w-[50vw] sm:max-w-full block">{evt.title || "Untitled Event"}</span>
                                          </Link>
                                          {evt.type && (
                                            <div className="mt-1">
                                              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-700 text-xs font-semibold uppercase">
                                                {evt.type.replace(/_/g, " ")}
                                              </span>
                                            </div>
                                          )}
                                          {evt.status && (
                                            <div className="mt-1">
                                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase">
                                                {evt.status}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <span className="truncate max-w-[50vw] sm:max-w-full block" title={"Event ID: " + interest.targetId}>Event ID: {interest.targetId}</span>
                                      )}
                                    </CardTitle>
                                    {isProfileOwner && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-100 ml-2 self-start"
                                        title="Remove interest"
                                        onClick={() => handleInterestDelete(interest, type)}
                                      >
                                        <Trash2 />
                                      </Button>
                                    )}
                                  </CardHeader>
                                  {evt && evt.startDateTime && (
                                    <div className="text-sm text-gray-600 flex items-center gap-2 pl-1">
                                      <Calendar className="w-4 h-4 text-emerald-600" />
                                      <span>
                                        {new Date(evt.startDateTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                        {" at "}
                                        {new Date(evt.startDateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                                      </span>
                                    </div>
                                  )}
                                </Card>
                              );
                            })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No interests in this category.</p>
                  )}
                </section>
              );
            })}
        </div>
      ) : (
        <div className="text-gray-500">No interests found.</div>
      );
    }
    return <div className="text-gray-500">No activity found.</div>;
  }

  function handleDelete(bm: any, type: string) {
    let url = "/api/bookmarks/";
    let body: any = {};
    if (type === "people") {
      url += "person";
      body = { targetPersonId: bm.targetId };
    } else if (type === "jobs") {
      url += "job";
      body = { targetJobId: bm.targetId };
    } else if (type === "posts") {
      url += "post";
      body = { targetPostId: bm.targetId };
    } else if (type === "opportunities") {
      url += "opportunity";
      body = { targetOpportunityId: bm.targetId };
    } else if (type === "events") {
      url += "event";
      body = { targetEventId: bm.targetId };
    } else {
      alert("Unbookmarking for this type is not implemented yet.");
      return;
    }
    fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.ok) {
        setBookmarks((prev: any) => {
          if (!prev) return prev;
          const items = prev[type];
          if (!Array.isArray(items)) return prev;
          return {
            ...prev,
            [type]: items.filter((b: any) => b.id !== bm.id),
          };
        });
      }
    });
  }

  function handleInterestDelete(entry: any, type: string) {
    const targetType = type === "jobs" ? "JOB" : type === "opportunities" ? "OPPORTUNITY" : type === "events" ? "EVENT" : null;
    if (!targetType) return;
    fetch("/api/interests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId: entry.targetId }),
    }).then((res) => {
      if (res.ok) {
        setInterestGroups((prev: any) => {
          if (!prev) return prev;
          const items = prev[type];
          if (!Array.isArray(items)) return prev;
          return {
            ...prev,
            [type]: items.filter((i: any) => i.id !== entry.id),
          };
        });
      }
    });
  }

  if (notFound) return <NotFound />;
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-20 sm:pb-4">
      <EditPostModal
        open={!!editPost}
        editContent={editContent}
        editPostType={editPostType}
        postTypeOptions={postTypeOptions}
        editError={editError}
        editSubmitting={editSubmitting}
        editAction={editAction}
        onClose={() => setEditPost(null)}
        onSubmit={handleEditSave}
        onDelete={handleEditDelete}
        onChangeContent={setEditContent}
        onChangeType={setEditPostType}
      />

      {/* Profile Header Card */}
      <div className="mb-2">  {/* reduced bottom margin */}
        {profile && (
          <div className="rounded-xl border-2 border-blue-400 bg-white shadow p-4 flex flex-row items-center gap-3">
            <ProfileImage src={profile.profileImage} name={profile.firstName + ' ' + profile.lastName} className="h-16 w-16" alt={profile.firstName + ' ' + profile.lastName} />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 w-full">
                <div className="min-w-0 w-full">
                  {/* Name and person type as a link */}
                  {/* View Profile Button */}
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full">
                    <Link href={`/profile/${profile.id}`} className="text-xl font-bold text-blue-700 hover:underline truncate">
                      {profile.firstName} {profile.lastName}
                    </Link>
                    {profile.type && (
                      <div className="flex flex-wrap gap-1 ml-0 sm:ml-1">
                        {String(profile.type).split("_").map((part, index) => {
                          const meta = TYPE_META[part] || {
                            bg: "bg-gray-100",
                            text: "text-gray-700",
                            icon: "⭐",
                            label: part.charAt(0) + part.slice(1).toLowerCase(),
                          };
                          return (
                            <Badge
                              key={`${profile.id}-${index}`}
                              className={`text-xs font-semibold pointer-events-none ${meta.bg} ${meta.text}`}
                            >
                              <span className="text-sm mr-1">{meta.icon}</span>
                              {meta.label}
                            </Badge>
                          );
                        })}
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
        <div className="flex gap-4 border-b mb-3">
          {tabs.map(t => {
            const Icon = t.icon;
            let activeText = "";
            let activeBorder = "";
            let hoverText = "";
            if (t.key === "jobs") {
              activeText = "text-blue-700";
              activeBorder = "border-blue-600";
              hoverText = "hover:text-blue-700";
            } else if (t.key === "opportunities") {
              activeText = "text-purple-700";
              activeBorder = "border-purple-600";
              hoverText = "hover:text-purple-700";
            } else if (t.key === "posts") {
              activeText = "text-pink-700";
              activeBorder = "border-pink-600";
              hoverText = "hover:text-pink-700";
            } else if (t.key === "bookmarks") {
              activeText = "text-yellow-700";
              activeBorder = "border-yellow-500";
              hoverText = "hover:text-yellow-700";
            } else if (t.key === "interests") {
              activeText = "text-red-700";
              activeBorder = "border-red-600";
              hoverText = "hover:text-red-700";
            }
            return (
              <button
                key={t.key}
                className={`px-4 py-2 font-semibold inline-flex items-center gap-2 border-b-2 ${
                  tab === t.key
                    ? `${activeText} ${activeBorder}`
                    : `text-gray-600 border-transparent ${hoverText}`
                }`}
                onClick={() => setTab(t.key)}
              >
                {Icon && <Icon className="w-5 h-5" aria-hidden />}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Post Type Filter (shown only when Posts tab is active) */}
        {tab === 'posts' && (
          <div className="flex justify-end mb-2">
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

        {/* Jobs Filter (shown only when Jobs tab is active) - collapsible on small screens */}
        {tab === 'jobs' && (
          <div className="mb-2">
            {/* Show Filters button for small screens */}
            <div className="flex sm:hidden justify-end mb-2">
              <button
                type="button"
                className="px-3 py-1 rounded border border-blue-300 text-blue-700 bg-white text-sm font-medium shadow-sm hover:bg-blue-50 transition flex items-center gap-2"
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter size={16} className="inline-block" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            {/* Filter section: always visible on sm+, collapsible on small screens */}
            <div className={`w-full flex justify-end ${showFilters ? '' : 'hidden'} sm:flex`}>
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
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
                {/* Skills filter removed */}
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Filter (shown only when Opportunities tab is active) - collapsible on small screens */}
        {tab === 'opportunities' && (
          <div className="mb-2">
            {/* Show Filters button for small screens */}
            <div className="flex sm:hidden justify-end mb-2">
              <button
                type="button"
                className="px-3 py-1 rounded border border-purple-300 text-purple-700 bg-white text-sm font-medium shadow-sm hover:bg-purple-50 transition flex items-center gap-2"
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter size={16} className="inline-block" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            {/* Filter section: always visible on sm+, collapsible on small screens */}
            <div className={`w-full flex justify-end ${showFilters ? '' : 'hidden'} sm:flex`}>
              <div className="flex items-center gap-3 w-full sm:w-auto">
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
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-4 min-h-[200px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
