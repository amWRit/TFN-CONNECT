import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TagIcon, InformationCircleIcon, PencilIcon, BookmarkIcon, BookmarkSquareIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Users, Bookmark, BookmarkCheck, } from "lucide-react";
import { useSession } from "next-auth/react";

// Helper to count lines in markdown string
function countLines(str: string) {
  return (str.match(/\n/g) || []).length + 1;
}
// Linkify function to convert URLs to markdown links
function linkify(text: string) {
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `[${url}](${href})`;
  });
}

interface OpportunityCardProps {
  id: string;
  title: string;
  description?: string;
  overview?: string;
  types: string[];
  status: string;
  location?: string;
  createdById?: string;
  createdByName?: string;
  showOverviewOnly?: boolean;
}



const OpportunityCard: React.FC<OpportunityCardProps> = ({ id, title, description, overview, types, status, location, createdById, createdByName, showOverviewOnly }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isOwner = userId && createdById && userId === createdById;
  const [bookmarkState, setBookmarkState] = useState({ bookmarked: false, loading: false });
  // Collapsible description state (should be inside component)
  const [descExpanded, setDescExpanded] = useState(false);
  const MAX_DESC_LINES = 8;

  useEffect(() => {
    if (!userId || isOwner) return;
    let ignore = false;
    const fetchBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/opportunity?targetOpportunityId=${id}`);
        const data = await res.json();
        if (!ignore) setBookmarkState({ bookmarked: !!data.bookmarked, loading: false });
      } catch {
        if (!ignore) setBookmarkState({ bookmarked: false, loading: false });
      }
    };
    fetchBookmark();
    return () => { ignore = true; };
  }, [userId, isOwner, id]);

  return (
    <Card className="relative border-2 border-purple-400 hover:border-purple-600 transition-all duration-300 rounded-xl overflow-hidden pt-5 px-6 pb-4 bg-white shadow-sm">
      {/* Top Status Bar - absolutely positioned */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400 rounded-t-xl" />
      {/* Edit or Bookmark Button (top right) */}
      {session?.user && isOwner ? (
        <button
          aria-label="Edit Opportunity"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = `/opportunities/${id}/edit`;
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors duration-200 border-2 border-purple-400 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-500 hover:scale-110"
          style={{ zIndex: 20 }}
        >
          <PencilIcon className="h-6 w-6" />
        </button>
      ) : session?.user && !isOwner && (
        <div className="group absolute top-4 right-4" style={{ zIndex: 20 }}>
          <button
            aria-label={bookmarkState.bookmarked ? "Remove Bookmark" : "Add Bookmark"}
            disabled={bookmarkState.loading}
            onClick={async (e) => {
              e.preventDefault();
              setBookmarkState((prev) => ({ ...prev, loading: true }));
              try {
                const res = await fetch("/api/bookmarks/opportunity", {
                  method: bookmarkState.bookmarked ? "DELETE" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ targetOpportunityId: id }),
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
            className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarkState.bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60`}
          >
            {bookmarkState.bookmarked ? <BookmarkCheck className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />}
          </button>
          {!bookmarkState.bookmarked && (
            <div className="absolute top-12 right-0 z-40 hidden group-hover:block bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
              Add to my bookmarks
            </div>
          )}
        </div>
      )}
      {/* Status badge above title */}
      <div className="flex flex-col gap-1 mb-2">
        <span className={`self-start flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> 
          {status === 'OPEN' ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-400" />
          )}
          {status}
        </span>
        <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2">
          <Link href={`/opportunities/${id}`} className="hover:underline">{title}</Link>
        </h2>
        {createdByName && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <Users className="h-4 w-4 mr-1 text-purple-400" />
            <span>Posted by </span>
            {createdById ? (
              <Link href={`/profile/${createdById}`} className="text-purple-700 hover:underline font-semibold">{createdByName}</Link>
            ) : (
              <span>{createdByName}</span>
            )}
          </div>
        )}
      </div>
      {/* Type badges */}
      <div className="flex gap-2 flex-wrap mb-2 ml-1">
        {types.map((type) => (
          <Badge key={type} variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 uppercase flex items-center">
            <TagIcon className="h-4 w-4 text-purple-400 mr-1" /> {type}
          </Badge>
        ))}
      </div>
      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
        <MapPinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
        <span>{location ? location : '---'}</span>
      </div>
      {/* Overview/description logic */}
      {showOverviewOnly ? (
        overview && (
          <div className="mb-2 text-sm text-gray-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <EyeIcon className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span className="font-semibold text-purple-700">Overview</span>
            </div>
            <span>{overview}</span>
          </div>
        )
      ) : (
        <>
          {overview && (
            <div className="mb-2 text-sm text-gray-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <EyeIcon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <span className="font-semibold text-purple-700">Overview</span>
              </div>
              <span>{overview}</span>
            </div>
          )}
          {description && description.trim() !== '' ? (
            <div className="mb-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
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
                      strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
                      em: ({node, ...props}) => <em {...props} className="italic" />,
                      ul: ({node, ...props}) => <ul {...props} className="list-disc ml-6" />,
                      ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-6" />,
                      li: ({node, ...props}) => <li {...props} className="mb-1" />,
                      a: ({node, ...props}) => <a {...props} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer" />,
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
          ) : (
            <div className="mb-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="font-semibold text-blue-700">Description</span>
              </div>
              <div className="text-gray-400 italic">---</div>
            </div>
          )}
        </>
      )}
      {showOverviewOnly && (
        <div className="flex justify-end mt-3">
          <Link href={`/opportunities/${id}`}>
            <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow transition">
              View
            </button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default OpportunityCard;
