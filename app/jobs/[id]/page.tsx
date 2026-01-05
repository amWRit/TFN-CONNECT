"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { HeartIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { JobPostingCard } from "@/components/JobPostingCard"
import { ProfileImage } from "@/components/ProfileImage";

interface JobPosting {
  id: string
  title: string
  description: string
  location?: string
  jobType: string
  requiredSkills?: string[]
  school?: {
    name: string
  }
  createdBy?: {
    id?: string;
    firstName: string;
    lastName: string;
  }
  applications: Array<{
    id: string
  }>
  status?: string
}


import React from "react"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [skillMap, setSkillMap] = useState<Record<string, string>>({});
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [optimisticInterested, setOptimisticInterested] = useState(false);
  const [interests, setInterests] = useState<any[]>([]);
  const router = useRouter()
  const { id } = React.use(params)
  const { data: session } = useSession();

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      const [jobRes, skillsRes, interestsRes] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch('/api/skills'),
        fetch(`/api/interests?targetType=JOB&targetId=${id}`)
      ]);
      if (!jobRes.ok) {
        setLoading(false);
        return;
      }
      const jobData = await jobRes.json();
      const skillsData = await skillsRes.json();
      const interestsData = interestsRes.ok ? await interestsRes.json() : [];
      const map: Record<string, string> = {};
      for (const skill of skillsData) {
        map[skill.id] = skill.name;
      }
      setSkillMap(map);
      setJob(jobData);
      setInterests(interestsData);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading job...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Job not found</div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.back()}>Go Back</button>
      </div>
    )
  }

  let requiredSkills: string[] = [];
  if (job?.requiredSkills) {
    requiredSkills = Array.isArray(job.requiredSkills)
      ? job.requiredSkills.map((id) => skillMap[id] || id)
      : [];
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Edit button for job owner */}
        {session?.user?.id && job?.createdBy?.id === session.user.id && (
          <div className="flex justify-end mb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
              onClick={() => router.push(`/jobs/${job.id}/edit`)}
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit
            </button>
          </div>
        )}
        <JobPostingCard
          id={job.id}
          title={job.title}
          company={job.school ? job.school.name : undefined}
          location={job.location}
          jobType={job.jobType}
          status={job.status}
          description={job.description}
          requiredSkills={requiredSkills}
          createdBy={job.createdBy}
          hideViewButton={true}
        />

        {/* Show interested people if owner */}
        {session?.user?.id && job?.createdBy?.id === session.user.id && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">People Interested</h2>
            {interests && interests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  interest.user && interest.user.id ? (
                    <a
                      key={interest.id}
                      href={`/profile/${interest.user.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow border-2 border-blue-400 hover:shadow-lg transition-all duration-150">
                        <ProfileImage
                          src={interest.user.profileImage}
                          name={`${interest.user.firstName} ${interest.user.lastName}`}
                          className="h-12 w-12 rounded-full border-2 border-blue-200 object-cover"
                          alt={`${interest.user.firstName} ${interest.user.lastName}`}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-700 text-base">{interest.user.firstName} {interest.user.lastName}</span>
                          {interest.user.type && (
                            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">{interest.user.type}</span>
                          )}
                        </div>
                      </div>
                    </a>
                  ) : null
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No interested people yet.</div>
            )}
          </div>
        )}
      </div>
      {/* Floating Interest Button (if signed in and not owner) */}
      {session?.user?.id && job?.createdBy?.id !== session.user.id && (
        (() => {
          const alreadyInterested = optimisticInterested || interests.some((i: { personId?: string }) => i.personId === session.user.id);
          if (!alreadyInterested) {
            return (
              <div className="fixed bottom-8 right-8 z-30">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow-lg text-lg transition-all duration-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.15)" }}
                  disabled={interestLoading}
                  onClick={async () => {
                    setInterestLoading(true);
                    await fetch("/api/interests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ targetType: "JOB", targetId: id })
                    });
                    setInterestLoading(false);
                    setInterestSuccess(true);
                    setOptimisticInterested(true);
                    setLoading(true);
                    fetch(`/api/interests?targetType=JOB&targetId=${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setInterests(data);
                        setLoading(false);
                        if (data && Array.isArray(data) && data.some((i: { personId?: string }) => i.personId === session.user.id)) {
                          setOptimisticInterested(false);
                        }
                      });
                    setTimeout(() => setInterestSuccess(false), 4000);
                  }}
                >
                  <HeartIcon className="h-6 w-6 text-white" />
                  {interestLoading ? "Submitting..." : "I'm Interested"}
                </button>
                {interestSuccess && (
                  <div className="mt-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-lg border border-green-300 animate-fade-in">
                    Notified to the author that you are interested
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className="fixed bottom-8 right-8 z-30 group">
                <button
                  className="flex items-center gap-2 px-6 py-3 border border-red-400 text-red-600 bg-white hover:bg-red-50 rounded-full font-semibold shadow-lg text-lg transition-all duration-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.10)" }}
                  disabled={interestLoading}
                  onClick={async () => {
                    setInterestLoading(true);
                    await fetch("/api/interests", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ targetType: "JOB", targetId: id })
                    });
                    setInterestLoading(false);
                    setOptimisticInterested(false);
                    setLoading(true);
                    fetch(`/api/interests?targetType=JOB&targetId=${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setInterests(data);
                        setLoading(false);
                      });
                  }}
                >
                  <HeartIcon className="h-6 w-6 text-red-400" />
                  {interestLoading ? "Removing..." : "Remove Interest"}
                </button>
                <div className="absolute bottom-16 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  Click to remove your interest in this job
                </div>
              </div>
            );
          }
        })()
      )}
    </div>
  );
}
