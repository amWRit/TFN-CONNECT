
"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { BriefcaseIcon, MapPinIcon, TagIcon, InformationCircleIcon, PencilSquareIcon, HeartIcon, UserIcon, BookmarkIcon, BookmarkSquareIcon } from "@heroicons/react/24/outline";
import OpportunityCard from "@/components/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ProfileImage";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Opportunity {
  id: string;
  title: string;
  overview?: string;
  description: string;
  types: string[];
  location?: string;
  status?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email1?: string;
  };
  interests: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email1?: string;
      profileImage?: string;
    };
  }>;
}

export default function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [optimisticInterested, setOptimisticInterested] = useState(false);
  const router = useRouter();
  const { id } = use(params);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/opportunities/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setOpportunity(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading opportunity...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Opportunity not found</div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

          // ...existing code...
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Card (left column) */}
        <div className="flex-1 min-w-0">
          <OpportunityCard
            id={opportunity.id}
            title={opportunity.title}
            overview={opportunity.overview}
            description={opportunity.description}
            types={opportunity.types}
            status={opportunity.status || ""}
            location={opportunity.location}
            createdById={opportunity.createdBy?.id}
            createdByName={opportunity.createdBy ? `${opportunity.createdBy.firstName} ${opportunity.createdBy.lastName}` : undefined}
            showOverviewOnly={false}
          />
        </div>
        {/* People Interested (right column, only for owner) */}
        {session?.user?.id && opportunity?.createdBy?.id === session.user.id && (
          <div className="w-full md:w-64 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">People Interested</h2>
            {opportunity.interests && opportunity.interests.length > 0 ? (
              (() => {
                const validInterests = opportunity.interests.filter(interest => interest.user && interest.user.id);
                if (validInterests.length > 0) {
                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {validInterests.map((interest) => (
                        <Link
                          key={interest.id}
                          href={`/profile/${interest.user.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow border-2 border-purple-400 hover:shadow-lg transition-all duration-150">
                            <ProfileImage
                              src={interest.user.profileImage}
                              name={`${interest.user.firstName} ${interest.user.lastName}`}
                              className="h-12 w-12 rounded-full border-2 border-blue-200 object-cover"
                              alt={`${interest.user.firstName} ${interest.user.lastName}`}
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-blue-700 text-base">{interest.user.firstName} {interest.user.lastName}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="text-gray-500">No people to show<br /><span className='text-xs text-gray-400'>Debug: {JSON.stringify(opportunity.interests)}</span></div>
                  );
                }
              })()
            ) : (
              <div className="text-gray-500">No interested people yet.</div>
            )}
          </div>
        )}
      </div>

      {/* Floating Interest Button (if signed in and not owner) */}
      {session?.user?.id && opportunity?.createdBy?.id !== session.user.id && Array.isArray(opportunity?.interests) && (
        (() => {
          const alreadyInterested = optimisticInterested || opportunity.interests.some((i: { user?: { id: string } }) => i.user && i.user.id === session.user.id);
          if (!alreadyInterested) {
            return (
              <div className="fixed bottom-8 right-8 z-30 group">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow-lg text-lg transition-all duration-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.15)" }}
                  disabled={interestLoading}
                  onClick={async () => {
                    setInterestLoading(true);
                    await fetch("/api/interests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ targetType: "OPPORTUNITY", targetId: id })
                    });
                    setInterestLoading(false);
                    setInterestSuccess(true);
                    setOptimisticInterested(true);
                    setLoading(true);
                    fetch(`/api/opportunities/${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setOpportunity(data);
                        setLoading(false);
                        if (data.interests && Array.isArray(data.interests) && data.interests.some((i: { user?: { id: string } }) => i.user && i.user.id === session.user.id)) {
                          setOptimisticInterested(false);
                        }
                      });
                    setTimeout(() => setInterestSuccess(false), 4000);
                  }}
                >
                  <HeartIcon className="h-6 w-6 text-white" />
                  {interestLoading ? "Submitting..." : "I'm Interested"}
                </button>
                <div className="absolute bottom-16 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  This will let the opportunity poster know that you are interested
                </div>
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
                      body: JSON.stringify({ targetType: "OPPORTUNITY", targetId: id })
                    });
                    setInterestLoading(false);
                    setOptimisticInterested(false);
                    setLoading(true);
                    fetch(`/api/opportunities/${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setOpportunity(data);
                        setLoading(false);
                      });
                  }}
                >
                  <HeartIcon className="h-6 w-6 text-red-400" />
                  {interestLoading ? "Removing..." : "Remove Interest"}
                </button>
                <div className="absolute bottom-16 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  Click to remove your interest in this opportunity
                </div>
              </div>
            );
          }
        })()
      )}
    </div>
  );
}
