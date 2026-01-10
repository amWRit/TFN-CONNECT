// Linkify function to convert URLs to markdown links
function linkify(text: string) {
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `[${url}](${href})`;
  });
}
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Info, Users, Bookmark, BookmarkCheck, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface JobPostingProps {
  id: string;
  title: string;
  company?: string;
  location?: string;
  jobType: string;
  status?: string;
  description: string;
  requiredSkills?: string[];
  applicants?: number;
  href?: string;
  onView?: () => void;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  hideViewButton?: boolean;
  deadline?: string;
  // When true, this card is being viewed in an admin context
  // (e.g. localStorage bypass admin on activity page) and should
  // show the edit icon instead of bookmark, and skip bookmark logic.
  adminView?: boolean;
}

export function JobPostingCard({
  id,
  title,
  company,
  location,
  jobType,
  status,
  description,
  requiredSkills = [],
  // applicants = 0,
  href,
  onView,
  createdBy,
  hideViewButton = false,
  deadline,
  adminView = false,
}: JobPostingProps) {
  const { data: session } = useSession();
  const isSessionAdmin = (session?.user as any)?.type === "ADMIN";
  const isEffectiveAdmin = adminView || isSessionAdmin;
  const [bookmarkState, setBookmarkState] = useState({ bookmarked: false, loading: false });

  useEffect(() => {
    // Admin views (including localStorage bypass admins) don't use bookmarks,
    // so skip bookmark fetch entirely for them.
    if (!session || !session.user || isEffectiveAdmin) return;
    let ignore = false;
    const fetchBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/job?targetJobId=${id}`);
        const data = await res.json();
        if (!ignore) setBookmarkState({ bookmarked: !!data.bookmarked, loading: false });
      } catch {
        if (!ignore) setBookmarkState({ bookmarked: false, loading: false });
      }
    };
    fetchBookmark();
    return () => { ignore = true; };
  }, [session, id, isEffectiveAdmin]);
  // Map enums to user-friendly labels
  const jobTypeLabels: Record<string, string> = {
    FULL_TIME: '💼 Full-time',
    PART_TIME: '⏰ Part-time',
    CONTRACT: '📋 Contract',
    INTERNSHIP: '🎓 Internship',
    VOLUNTEER: '🤝 Volunteer',
    FREELANCE: '🎯 Freelance',
    TEMPORARY: '🕒 Temporary',
    REMOTE: '🌐 Remote',
    HYBRID: '🔀 Hybrid',
  };
  const jobStatusLabels: Record<string, string> = {
    OPEN: '🟢 Open',
    FILLED: '✅ Filled',
    CLOSED: '🚫 Closed',
    PAUSED: '⏸️ Paused',
    DRAFT: '📝 Draft',
  };
  const jobTypeColor: Record<string, string> = {
    FULL_TIME: 'bg-blue-100 text-blue-700',
    PART_TIME: 'bg-purple-100 text-purple-700',
    CONTRACT: 'bg-yellow-100 text-yellow-700',
    INTERNSHIP: 'bg-green-100 text-green-700',
    VOLUNTEER: 'bg-pink-100 text-pink-700',
    FREELANCE: 'bg-orange-100 text-orange-700',
    TEMPORARY: 'bg-gray-100 text-gray-700',
    REMOTE: 'bg-cyan-100 text-cyan-700',
    HYBRID: 'bg-indigo-100 text-indigo-700',
  };
  const jobStatusColor: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-700',
    FILLED: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-200 text-gray-500',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    DRAFT: 'bg-gray-100 text-gray-700',
  };

  const isDetailPage = !href;
  // Determine if current user is the job owner by createdBy.id
  // Add fallback and debug logging
  const userId = session?.user?.id;
  const ownerId = createdBy?.id;
  if (typeof window !== "undefined") {
    // For debugging, log ids to console
    // Remove this after confirming
    console.log("JobPostingCard: userId", userId, "ownerId", ownerId, "isSessionAdmin", isSessionAdmin, "adminView", adminView);
  }
  const isJobOwner = !!userId && !!ownerId && userId === ownerId;
  const showEdit = (session?.user && isJobOwner) || isEffectiveAdmin;
  const showBookmark = session?.user && !isJobOwner && !isEffectiveAdmin;

  return (
    <Card className={`relative border-2 border-green-400 bg-white hover:shadow-xl hover:border-green-500 transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col${isDetailPage ? ' min-h-[340px]' : ''}`}> 
      {/* Top Status Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition" />
      <CardHeader style={{ position: 'relative' }}>
        {/* Edit or Bookmark Button (top right) */}
        {showEdit ? (
          <button
            aria-label="Edit Job"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = `/jobs/${id}/edit`;
              }
            }}
            className="p-2 rounded-full shadow-md transition-colors duration-200 border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:scale-110 ml-2"
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }}
          >
            <Pencil size={24} strokeWidth={2} className="text-blue-600" />
          </button>
        ) : showBookmark && (
          <div className="group" style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }}>
            <button
              aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
              disabled={bookmarkState.loading}
              onClick={async (e) => {
                e.preventDefault();
                setBookmarkState((prev) => ({ ...prev, loading: true }));
                try {
                  const res = await fetch("/api/bookmarks/job", {
                    method: bookmarkState.bookmarked ? "DELETE" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetJobId: id }),
                  });
                  if (res.ok) {
                    setBookmarkState((prev) => ({ bookmarked: !prev.bookmarked, loading: false }));
                  } else {
                    setBookmarkState((prev) => ({ ...prev, loading: false }));
                  }
                } catch {
                  setBookmarkState((prev) => ({ ...prev, loading: false }));
                }
              }}
              className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarkState.bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60 ml-2`}
            >
              {bookmarkState.bookmarked ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
            </button>
            {!bookmarkState.bookmarked && (
              <div className="absolute top-12 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                Add to my bookmarks
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {jobType && (
                <Badge className={`${jobTypeColor[jobType] || "bg-gray-100 text-gray-800"} pointer-events-none`}>
                  {jobTypeLabels[jobType] || jobType.replace(/_/g, ' ')}
                </Badge>
              )}
              {status && (
                <Badge className={`${jobStatusColor[status] || "bg-gray-100 text-gray-800"} pointer-events-none`}>
                  {jobStatusLabels[status] || status}
                </Badge>
              )}
              {/* Deadline badge at top only for detail page */}
              {isDetailPage && deadline && (() => {
                const now = new Date();
                const deadlineDate = new Date(deadline);
                const diff = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                const isExpiring = diff >= 0 && diff <= 7;
                const isExpired = deadlineDate.getTime() < now.getTime();
                return (
                  <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deadline: {deadlineDate.toLocaleDateString()}
                    {isExpired ? (
                      <span className="ml-1 font-bold uppercase text-red-800">EXPIRED</span>
                    ) : isExpiring ? (
                      <span className="ml-1 font-bold uppercase">Expiring Soon</span>
                    ) : null}
                  </Badge>
                );
              })()}
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
              {href ? (
                <Link href={href} className="hover:underline focus:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </CardTitle>
            {company && (
              <CardDescription className="text-sm font-semibold text-gray-700 mt-1">
                {company}
              </CardDescription>
            )}
            {createdBy && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Users className="h-4 w-4 mr-1 text-blue-400" />
                <span>Posted by </span>
                {createdBy.id ? (
                  <Link href={`/profile/${createdBy.id}`} className="text-blue-700 hover:underline font-semibold">{createdBy.firstName} {createdBy.lastName}</Link>
                ) : (
                  <span>{createdBy.firstName} {createdBy.lastName}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={`flex flex-col${isDetailPage ? ' flex-1' : ''}`}>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span className="font-medium">{location ? location : '---'}</span>
        </div>

        {/* Only show description and required skills if detail page */}
        {isDetailPage && (
          <>
            {/* Collapsible markdown description section */}
            {description && description.trim() !== '' ? (() => {
              // Helper to count lines in markdown string
              function countLines(str: string) {
                return (str.match(/\n/g) || []).length + 1;
              }
              const MAX_DESC_LINES = 8;
              const [descExpanded, setDescExpanded] = useState(false);
              // Use a local state for expansion
              // Use a wrapper function to allow hooks in function body
              return (
                <div className="mb-4 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-blue-700">Description</span>
                  </div>
                  <div className="markdown-content w-full relative">
                    <div style={{
                      maxHeight: !descExpanded && countLines(description || "") > MAX_DESC_LINES ? `${1.6 * MAX_DESC_LINES}em` : undefined,
                      overflow: !descExpanded && countLines(description || "") > MAX_DESC_LINES ? 'hidden' : undefined,
                      position: 'relative',
                      transition: 'max-height 0.3s',
                    }}>
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2 text-blue-900" />,
                          h2: ({node, ...props}) => <h2 {...props} className="text-xl font-bold mt-3 mb-2 text-blue-800" />,
                          h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold mt-3 mb-1 text-blue-700" />,
                          h4: ({node, ...props}) => <h4 {...props} className="text-base font-semibold mt-2 mb-1 text-blue-600" />,
                          h5: ({node, ...props}) => <h5 {...props} className="text-sm font-semibold mt-2 mb-1 text-blue-500" />,
                          h6: ({node, ...props}) => <h6 {...props} className="text-xs font-semibold mt-2 mb-1 text-blue-400" />,
                          a: ({node, ...props}) => <a {...props} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer" />,
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
                    {countLines(description || "") > MAX_DESC_LINES && (
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-blue-50 to-transparent flex items-end justify-center pointer-events-none" style={{display: descExpanded ? 'none' : 'flex'}} />
                    )}
                  </div>
                  {countLines(description || "") > MAX_DESC_LINES && (
                    <button
                      className="mt-2 text-xs text-blue-600 underline font-semibold focus:outline-none"
                      onClick={() => setDescExpanded(v => !v)}
                      type="button"
                    >
                      {descExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              );
            })() : (
              <div className="mb-4 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="font-semibold text-blue-700">Description</span>
                </div>
                <div className="text-gray-400 italic">---</div>
              </div>
            )}

            {requiredSkills.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold mb-2 text-gray-900 uppercase tracking-wide">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} className="text-xs font-medium bg-blue-100 text-blue-700 pointer-events-none">
                      ✓ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className={`flex flex-row items-end justify-between gap-3 pt-3 border-t border-gray-100 w-full${isDetailPage ? ' mt-auto' : ''}`}> 
          {/* Deadline badge at bottom only for listing page */}
          {!isDetailPage && (
            deadline ? (() => {
              const now = new Date();
              const deadlineDate = new Date(deadline);
              const diff = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              const isExpiring = diff >= 0 && diff <= 7;
              const isExpired = deadlineDate.getTime() < now.getTime();
              return (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700`}
                >
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Deadline: {deadlineDate.toLocaleDateString()}
                  {isExpired ? (
                    <span className="ml-1 font-bold uppercase text-red-800">EXPIRED</span>
                  ) : isExpiring ? (
                    <span className="ml-1 font-bold uppercase">Expiring Soon</span>
                  ) : null}
                </span>
              );
            })() : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-400 bg-gray-100">Deadline: ---</span>
            )
          )}
          <div />
          <div>
            {!hideViewButton && (
              href ? (
                <Link href={href} passHref>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
                    asChild
                  >
                    <span>View</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={onView}
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  View
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
