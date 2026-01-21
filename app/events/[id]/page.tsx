"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileImage } from "@/components/ProfileImage";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import { CalendarPlus, Heart } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  overview?: string;
  location?: string;
  address?: string;
  tags?: string[];
  externalLink?: string;
  sponsors?: string[];
  startDateTime: string;
  endDateTime?: string;
  type: string;
  status: string;
  capacity?: number;
  rsvpCount?: number;
  isFree?: boolean;
  price?: number;
  organizerName?: string;
  organizerLink?: string;
  createdById: string;
  createdByName?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  rsvps?: Array<{
    id: string;
    status: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }>;
  interests?: Array<{
    id: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  }>;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [optimisticRsvp, setOptimisticRsvp] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [optimisticInterested, setOptimisticInterested] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const router = useRouter();
  const { id } = use(params);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  // Determine admin view
  useEffect(() => {
    if (typeof window === "undefined") return;
    const localAdmin = localStorage.getItem("adminAuth") === "true";
    const sessionIsAdmin = !!(session && (session as any).user && (session as any).user.type === "ADMIN");
    setIsAdminView(localAdmin || sessionIsAdmin);
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Event not found</div>
        <button
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwner = session?.user?.id === event.createdById;
  const canEdit = isOwner || isAdminView;


  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Card (left column) */}
          <div className="flex-1 min-w-0">
            <EventCard
              id={event.id}
              title={event.title}
              overview={event.overview}
              description={event.description}
              location={event.location}
              address={event.address}
              type={event.type}
              status={event.status}
              startDateTime={event.startDateTime}
              endDateTime={event.endDateTime}
              capacity={event.capacity}
              rsvpCount={event.rsvpCount}
              isFree={event.isFree}
              price={event.price}
              externalLink={event.externalLink}
              tags={event.tags}
              sponsors={event.sponsors}
              organizerName={event.organizerName}
              organizerLink={event.organizerLink}
              createdById={event.createdById}
              createdByName={event.createdByName || (event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : undefined)}
              showOverviewOnly={false}
              adminView={isAdminView}
            />
          </div>
          {/* People Interested (right column, only for owner or admin) */}
          {canEdit && (
            <div className="w-full md:w-64 flex-shrink-0">
              <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">People Interested</h2>
              {event.interests && event.interests.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {event.interests.filter(interest => interest.user && interest.user.id).map((interest) => (
                    <Link
                      key={interest.id}
                      href={`/profile/${interest.user!.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow border-2 border-emerald-400 hover:shadow-lg transition-all duration-150">
                        <ProfileImage
                          src={interest.user!.profileImage}
                          name={`${interest.user!.firstName} ${interest.user!.lastName}`}
                          className="h-12 w-12 rounded-full border-2 border-emerald-200 object-cover"
                          alt={`${interest.user!.firstName} ${interest.user!.lastName}`}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-700 text-base">{interest.user!.firstName} {interest.user!.lastName}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No interested people yet.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating I'm Interested Button (if signed in and not owner, and not in admin view) */}
      {!isAdminView && session?.user?.id && event?.createdById !== session.user.id && (
        (() => {
          const alreadyInterested = optimisticInterested || (event?.interests && Array.isArray(event.interests) && event.interests.some((i: { user?: { id: string } }) => i.user && i.user.id === session.user.id));
          if (!alreadyInterested) {
            return (
              <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-30 group">
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow-lg text-lg transition-all duration-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.15)" }}
                  disabled={interestLoading}
                  onClick={async () => {
                    setInterestLoading(true);
                    await fetch("/api/interests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ targetType: "EVENT", targetId: id })
                    });
                    setInterestLoading(false);
                    setInterestSuccess(true);
                    setOptimisticInterested(true);
                    // Refresh event data
                    fetch(`/api/events/${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setEvent(data);
                        if (data.interests && Array.isArray(data.interests) && data.interests.some((i: { user?: { id: string } }) => i.user && i.user.id === session.user.id)) {
                          setOptimisticInterested(false);
                        }
                      });
                    setTimeout(() => setInterestSuccess(false), 4000);
                  }}
                >
                  <Heart className="h-6 w-6 text-white" />
                  {interestLoading ? "Submitting..." : "I'm Interested"}
                </button>
                <div className="absolute bottom-16 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  Let the organizer know you're interested
                </div>
                {interestSuccess && (
                  <div className="mt-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-lg border border-green-300 animate-fade-in">
                    Notified the organizer that you are interested
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-30 group">
                <button
                  className="flex items-center gap-2 px-6 py-3 border border-pink-400 text-pink-600 bg-white hover:bg-pink-50 rounded-full font-semibold shadow-lg text-lg transition-all duration-200"
                  style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.10)" }}
                  disabled={interestLoading}
                  onClick={async () => {
                    setInterestLoading(true);
                    await fetch("/api/interests", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ targetType: "EVENT", targetId: id })
                    });
                    setInterestLoading(false);
                    setOptimisticInterested(false);
                    // Refresh event data
                    fetch(`/api/events/${id}`)
                      .then((res) => res.json())
                      .then((data) => {
                        setEvent(data);
                      });
                  }}
                >
                  <Heart className="h-6 w-6 text-pink-400" />
                  {interestLoading ? "Removing..." : "Remove Interest"}
                </button>
                <div className="absolute bottom-16 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  Click to remove your interest
                </div>
              </div>
            );
          }
        })()
      )}
    </div>
  );
}
