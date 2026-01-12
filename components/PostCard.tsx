import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Bookmark, BookmarkCheck, Briefcase, Trophy, Rocket, MessageSquare, FileText, PartyPopper, Star, Users, Pencil } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface PostProps {
  postId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  postType: string;
  likes: number;
  comments: number;
  createdAt: Date;
  hideDate?: boolean;
  hideBookmark?: boolean;
  hideStats?: boolean;
  leftBorder?: boolean;
  showEmojiBadge?: boolean;
  adminView?: boolean;
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case "achievement":
      return "bg-green-400 text-white ring-2 ring-green-300 shadow-md";
    case "job_posting":
      return "bg-blue-500 text-white ring-2 ring-blue-300 shadow-md";
    case "career_update":
      return "bg-purple-500 text-white ring-2 ring-purple-300 shadow-md";
    case "general":
      return "bg-yellow-400 text-white ring-2 ring-yellow-200 shadow-md";
    default:
      return "bg-pink-400 text-white ring-2 ring-pink-200 shadow-md";
  }
};

const getPostTypeBorder = (type: string) => {
  switch (type) {
    case "achievement":
      return "border-green-300 hover:border-green-400";
    case "job_posting":
      return "border-blue-300 hover:border-blue-400";
    case "career_update":
      return "border-purple-300 hover:border-purple-400";
    case "general":
      return "border-yellow-300 hover:border-yellow-400";
    default:
      return "border-gray-200 hover:border-gray-300";
  }
};

const getPostTypeIcon = (type: string) => {
  switch (type) {
    case "CAREER_UPDATE":
      return <Rocket className="w-4 h-4 mr-1" />;
    case "ACHIEVEMENT":
      return <Trophy className="w-4 h-4 mr-1" />;
    case "CERTIFICATION":
      return <Star className="w-4 h-4 mr-1" />;
    case "JOB_POSTING":
      return <Briefcase className="w-4 h-4 mr-1" />;
    case "JOB_APPLICATION":
      return <FileText className="w-4 h-4 mr-1" />;
    case "EVENT_ANNOUNCEMENT":
      return <PartyPopper className="w-4 h-4 mr-1" />;
    case "EVENT_RSVP":
      return <MessageSquare className="w-4 h-4 mr-1" />;
    case "ARTICLE_SHARE":
      return <FileText className="w-4 h-4 mr-1" />;
    case "RESOURCE_SHARE":
      return <FileText className="w-4 h-4 mr-1" />;
    case "SEEK_COLLABORATION":
      return <Users className="w-4 h-4 mr-1" />;
    case "SEEK_MENTOR":
      return <Star className="w-4 h-4 mr-1" />;
    case "OFFER_MENTORSHIP":
      return <Star className="w-4 h-4 mr-1" />;
    case "GENERAL":
      return <MessageSquare className="w-4 h-4 mr-1" />;
    default:
      return <FileText className="w-4 h-4 mr-1" />;
  }
};

export function PostCard({
  postId,
  author,
  content,
  postType,
  likes,
  comments,
  createdAt,
  showEmojiBadge = false,
  hideDate = false,
  hideBookmark = false,
  hideStats = false,
  leftBorder = false,
  onEdit,
  adminView = false,
}: PostProps & { onEdit?: () => void }) {
  const { status, data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const isOwner = author && author.id && session?.user?.id === author.id;
  const [localAdmin, setLocalAdmin] = useState(false);
  useEffect(() => {
    function syncAdmin() {
      setLocalAdmin(typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true');
    }
    syncAdmin();
    window.addEventListener('storage', syncAdmin);
    window.addEventListener('focus', syncAdmin);
    return () => {
      window.removeEventListener('storage', syncAdmin);
      window.removeEventListener('focus', syncAdmin);
    };
  }, []);
  const isSessionAdmin = (session?.user as any)?.type === 'ADMIN';
  const isEffectiveAdmin = adminView || isSessionAdmin || localAdmin;

  // Fetch initial bookmark state
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/bookmarks/post?targetPostId=${postId}`)
      .then((res) => res.json())
      .then((data) => setBookmarked(!!data.bookmarked))
      .catch(() => setBookmarked(false));
  }, [postId, status]);
  function formatDate(date: Date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  }

  function linkify(text: string) {
    // Replace plain URLs with Markdown links
    const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
    return text.replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      return `[${url}](${href})`;
    });
  }

  return (
    <Card
      className={`border-2 border-pink-400 bg-white transition-all duration-300 rounded-2xl overflow-hidden${leftBorder ? ' border-l-4 border-purple-400' : ''}`}
    >
      <CardHeader className="relative">
        {/* Edit or Bookmark Button (UI only) - top right */}
        {!hideBookmark && (
          (isOwner || isEffectiveAdmin) ? (
            <button
              aria-label="Edit Post"
              className="p-2 rounded-full shadow-md transition-colors duration-200 border-2 bg-white border-blue-300 text-blue-600 hover:bg-blue-50 hover:scale-110 disabled:opacity-60"
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
              onClick={onEdit}
            >
              <Pencil size={22} />
            </button>
          ) : (
            <button
              aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
              disabled={bookmarkLoading || status !== "authenticated"}
              onClick={async (e) => {
                e.preventDefault();
                setBookmarkLoading(true);
                try {
                  const res = await fetch("/api/bookmarks/post", {
                    method: bookmarked ? "DELETE" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetPostId: postId }),
                  });
                  if (res.ok) {
                    setBookmarked((prev) => !prev);
                  }
                } finally {
                  setBookmarkLoading(false);
                }
              }}
              className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60`}
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
            >
              {bookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
            </button>
          )
        )}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {author && author.profileImage ? (
              <img
                src={author.profileImage}
                alt={author.firstName}
                className="h-10 w-10 rounded-full flex-shrink-0 border-2 border-blue-200 shadow-sm"
              />
            ) : (
              <div className="h-10 w-10 rounded-full flex-shrink-0 border-2 border-blue-200 shadow-sm bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base uppercase">
                {author?.firstName?.[0] || ''}{author?.lastName?.[0] || ''}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-blue-700 group-hover:text-blue-800 transition m-0 p-0">
                  {author && author.id ? (
                    <Link href={`/profile?id=${encodeURIComponent(author.id)}`} className="hover:underline focus:underline">
                      {author.firstName} {author.lastName}
                    </Link>
                  ) : (
                    <span>Unknown Author</span>
                  )}
                </CardTitle>
                <Badge className={`${getPostTypeColor(postType)} flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1`} style={{ background: undefined, color: undefined }}>
                  {getPostTypeIcon(postType)}
                  <span>{postType.replace(/_/g, " ")}</span>
                </Badge>
              </div>
              {!hideDate && (
                <CardDescription className="text-xs text-gray-500">
                  {formatDate(createdAt)}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 mb-4 leading-relaxed break-words">
          <ReactMarkdown
            components={{
              a: ({node, ...props}) => <a {...props} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer" />,
              ul: ({node, ...props}) => <ul {...props} className="list-disc ml-6" />,
              ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-6" />,
              li: ({node, ...props}) => <li {...props} className="mb-1" />,
              strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
              em: ({node, ...props}) => <em {...props} className="italic" />,
              blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-blue-200 pl-4 italic text-gray-500 my-2" />,
              code: ({node, ...props}) => <code {...props} className="bg-gray-100 px-1 rounded text-xs" />,
            }}
          >
            {linkify(content)}
          </ReactMarkdown>
        </div>
        {/* Hide stats (love/comment) if hideStats is true */}
        {!hideStats && (
          <div className="flex gap-6 text-xs sm:text-sm text-gray-600">
            <button className="flex items-center gap-1.5 hover:text-red-500 transition">
              <Heart className="h-4 w-4" /> <span className="hidden sm:inline">{likes}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition">
              <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">{comments}</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
