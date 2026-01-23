"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Users, Pencil, Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// Linkify function to convert URLs to markdown links
function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith("http") ? url : `https://${url}`;
    return `[${url}](${href})`;
  });
}

interface EventCardProps {
  id: string;
  title: string;
  overview?: string;
  description?: string;
  location?: string;
  address?: string;
  type: string;
  status: string;
  startDateTime: string;
  endDateTime?: string;
  capacity?: number;
  rsvpCount?: number;
  isFree?: boolean;
  price?: number;
  externalLink?: string;
  tags?: string[];
  sponsors?: string[];
  organizerName?: string;
  organizerLink?: string;
  createdByName?: string;
  createdById?: string;
  showOverviewOnly?: boolean;
  adminView?: boolean;
  // Optionally allow explicit adminAuth override
  adminAuth?: boolean;
  onDelete?: (id: string) => void;
}

const eventTypeColors: Record<string, string> = {
  WORKSHOP: "bg-emerald-100 text-emerald-800",
  CONFERENCE: "bg-teal-100 text-teal-800",
  NETWORKING: "bg-green-100 text-green-800",
  TRAINING: "bg-lime-100 text-lime-800",
  REUNION: "bg-cyan-100 text-cyan-800",
  WEBINAR: "bg-emerald-100 text-emerald-700",
  HACKATHON: "bg-green-200 text-green-900",
  SOCIAL: "bg-teal-100 text-teal-700",
  FUNDRAISER: "bg-lime-200 text-lime-900",
  GENERAL: "bg-gray-100 text-gray-700",
  OTHER: "bg-gray-100 text-gray-600",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  PUBLISHED: "bg-emerald-500 text-white",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-300 text-slate-700",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventCard({
  id,
  title,
  overview,
  description,
  location,
  address,
  type,
  status,
  startDateTime,
  endDateTime,
  capacity,
  rsvpCount,
  isFree,
  price,
  externalLink,
  tags,
  sponsors,
  organizerName,
  organizerLink,
  createdByName,
  createdById,
  showOverviewOnly = true,
  adminView = false,
  adminAuth,
  onDelete,
}: EventCardProps) {
  const { data: session } = useSession();
  const [localAdminAuth, setLocalAdminAuth] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalAdminAuth(localStorage.getItem("adminAuth") === "true");
    }
  }, []);
  const userId = session?.user?.id;
  const userType = (session?.user as any)?.type;
  const isOwner = userId && createdById && userId === createdById;
  const isPrivilegedAdmin = (adminAuth ?? localAdminAuth) && (userType === "ADMIN" || userType === "STAFF_ADMIN");
  const isEffectiveAdmin = adminView || isPrivilegedAdmin;
  const showEdit = (session?.user && isOwner) || isEffectiveAdmin;
  const showBookmark = session?.user && !isOwner && !isEffectiveAdmin;

  const [bookmarkState, setBookmarkState] = useState({ bookmarked: false, loading: false });
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    // Skip bookmark fetch for owners and admins
    if (!userId || isOwner || isEffectiveAdmin) return;
    let ignore = false;
    const fetchBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/event?targetEventId=${id}`);
        const data = await res.json();
        if (!ignore) setBookmarkState({ bookmarked: !!data.bookmarked, loading: false });
      } catch {
        if (!ignore) setBookmarkState({ bookmarked: false, loading: false });
      }
    };
    fetchBookmark();
    return () => { ignore = true; };
  }, [userId, isOwner, id, isEffectiveAdmin]);

  return (
    <Card className="relative border-2 border-emerald-400 hover:border-emerald-600 transition-all duration-300 rounded-xl overflow-hidden pt-5 px-6 pb-4 bg-white shadow-sm group">
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-xl" />
      
      {/* Edit or Bookmark Button (top right) */}
      {showEdit ? (
        <button
          aria-label="Edit Event"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/events/${id}/edit`;
          }}
          className="absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors duration-200 border-2 border-emerald-400 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 hover:scale-110 z-20"
        >
          <Pencil size={20} strokeWidth={2} />
        </button>
      ) : showBookmark && (
        <div className="group/bookmark absolute top-4 right-4 z-20">
          <button
            aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
            disabled={bookmarkState.loading}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setBookmarkState((prev) => ({ ...prev, loading: true }));
              try {
                if (bookmarkState.bookmarked) {
                  await fetch("/api/bookmarks/event", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetEventId: id }),
                  });
                  setBookmarkState({ bookmarked: false, loading: false });
                } else {
                  await fetch("/api/bookmarks/event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetEventId: id }),
                  });
                  setBookmarkState({ bookmarked: true, loading: false });
                }
              } catch {
                setBookmarkState((prev) => ({ ...prev, loading: false }));
              }
            }}
            className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarkState.bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60`}
          >
            {bookmarkState.bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          {!bookmarkState.bookmarked && (
            <div className="absolute top-12 right-0 z-40 hidden group-hover/bookmark:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
              Add to my bookmarks
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold text-emerald-700 pr-12 mb-1">
        <Link href={`/events/${id}`} className="hover:underline group-hover:text-emerald-800 transition-colors block">
          <span className="text-lg font-semibold truncate block max-w-full">
            {title}
          </span>
        </Link>
      </h2>

      {/* Posted by */}
      {createdByName && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Users className="h-4 w-4 mr-1 text-emerald-400" />
          <span>Posted by </span>
          {createdById ? (
            <Link href={`/profile/${createdById}`} className="text-emerald-700 hover:underline font-semibold truncate block max-w-[50vw] sm:max-w-full">
              <span className="truncate">{createdByName}</span>
            </Link>
          ) : (
            <span className="truncate block max-w-[50vw] sm:max-w-full">{createdByName}</span>
          )}
        </div>
      )}

      {/* Type, Status, Price badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        <Badge className={`${eventTypeColors[type] || eventTypeColors.GENERAL} text-xs uppercase pointer-events-none`}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Badge>
        <Badge className={`${statusColors[status] || statusColors.DRAFT} text-xs uppercase pointer-events-none`}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
        {isFree ? (
          <Badge className="bg-green-100 text-green-700 text-xs pointer-events-none">Free</Badge>
        ) : price ? (
          <Badge className="bg-amber-100 text-amber-800 text-xs pointer-events-none">Rs. {price}</Badge>
        ) : null}
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Calendar className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <span className="font-medium">{formatDate(startDateTime)}</span>
        <Clock className="h-4 w-4 text-emerald-500 ml-2 flex-shrink-0" />
        <span className="font-medium">{formatTime(startDateTime)}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <span className="font-medium">{location || "---"}</span>
      </div>

      {/* Overview */}
      {overview && (
        <div className="mb-3 text-sm text-gray-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="font-semibold text-emerald-700">Overview</span>
          </div>
          <p className={showOverviewOnly ? "line-clamp-2" : ""}>{overview}</p>
        </div>
      )}

      {/* Description (full view only, markdown) */}
      {!showOverviewOnly && description && (
        <div className="mb-3 text-sm text-gray-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <InformationCircleIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="font-semibold text-emerald-700">Description</span>
          </div>
          <div className="markdown-content w-full relative">
            <div style={{
              maxHeight: !descExpanded && (description.match(/\n/g) || []).length + 1 > 8 ? `${1.6 * 8}em` : undefined,
              overflow: !descExpanded && (description.match(/\n/g) || []).length + 1 > 8 ? 'hidden' : undefined,
              position: 'relative',
              transition: 'max-height 0.3s',
            }}>
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2 text-emerald-900" />,
                  h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold mt-3 mb-2 text-emerald-800" />,
                  h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold mt-3 mb-1 text-emerald-700" />,
                  h4: ({node, ...props}) => <h4 {...props} className="text-base font-semibold mt-2 mb-1 text-emerald-600" />,
                  h5: ({node, ...props}) => <h5 {...props} className="text-sm font-semibold mt-2 mb-1 text-emerald-500" />,
                  h6: ({node, ...props}) => <h6 {...props} className="text-xs font-semibold mt-2 mb-1 text-emerald-400" />,
                  a: ({node, ...props}) => <a {...props} className="text-emerald-600 underline break-all" target="_blank" rel="noopener noreferrer" />,
                  strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
                  em: ({node, ...props}) => <em {...props} className="italic" />,
                  ul: ({node, ...props}) => <ul {...props} className="list-disc ml-6" />,
                  ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-6" />,
                  li: ({node, ...props}) => <li {...props} className="mb-1" />,
                }}
              >
                {linkify(description || "")}
              </ReactMarkdown>
            </div>
            {((description.match(/\n/g) || []).length + 1) > 8 && (
              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-emerald-50 to-transparent flex items-end justify-center pointer-events-none" style={{display: descExpanded ? 'none' : 'flex'}} />
            )}
          </div>
          {((description.match(/\n/g) || []).length + 1) > 8 && (
            <button
              className="mt-2 text-xs text-emerald-600 underline font-semibold focus:outline-none"
              onClick={() => setDescExpanded(v => !v)}
              type="button"
            >
              {descExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* External Link (full view only) */}
      {!showOverviewOnly && externalLink && (
        <div className="mb-3">
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline font-medium"
          >
            <span>Registration / Event Link →</span>
          </a>
        </div>
      )}

      {/* Organizer (full view only) */}
      {!showOverviewOnly && organizerName && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Organized by</h3>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {organizerName.charAt(0) || "?"}
            </div>
            <div>
              {organizerLink ? (
                <a
                  href={organizerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 text-sm hover:underline"
                >
                  {organizerName}
                </a>
              ) : (
                <p className="font-medium text-gray-800 text-sm">{organizerName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags (full view only) */}
      {!showOverviewOnly && tags && tags.length > 0 && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} className="bg-emerald-100 text-emerald-700 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sponsors (full view only) */}
      {!showOverviewOnly && sponsors && sponsors.length > 0 && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sponsors</h3>
          <div className="flex flex-wrap gap-2">
            {sponsors.map((sponsor, idx) => (
              <Badge key={idx} className="bg-teal-100 text-teal-700 text-xs">
                {sponsor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Capacity + View button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">
                {capacity} seats
              </span>
            </div>
          )}
        </div>
        {showOverviewOnly && (
          <Link href={`/events/${id}`}>
            <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition">
              View
            </button>
          </Link>
        )}
      </div>
    </Card>
  );
}
