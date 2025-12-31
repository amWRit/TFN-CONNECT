import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";

interface PostProps {
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
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case "achievement":
      return "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800";
    case "job_posting":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800";
    case "career_update":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800";
    case "general":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800";
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

const getPostTypeEmoji = (type: string) => {
  switch (type) {
    case "achievement":
      return "🏆";
    case "job_posting":
      return "💼";
    case "career_update":
      return "🚀";
    case "general":
      return "💬";
    default:
      return "📝";
  }
};

export function PostCard({
  author,
  content,
  postType,
  likes,
  comments,
  createdAt,
  showEmojiBadge = false,
}: PostProps) {
  // Placeholder for bookmark state (UI only for now)
  const [bookmarked, setBookmarked] = useState(false);
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

  return (
    <Card className={`border-2 bg-white hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden ${getPostTypeBorder(postType)}`}>
      <CardHeader className="relative">
        {/* Bookmark Button (UI only) - top right */}
        <button
          aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((prev) => !prev);
          }}
          className={`p-2 rounded-full shadow-md transition-colors duration-200 border-2 ${bookmarked ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-white border-gray-300 text-yellow-500 hover:bg-yellow-100'} hover:scale-110 disabled:opacity-60`}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
        >
          {bookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
        </button>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {author.profileImage && (
              <img
                src={author.profileImage}
                alt={author.firstName}
                className="h-10 w-10 rounded-full flex-shrink-0 border-2 border-blue-200 shadow-sm"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-blue-700 group-hover:text-blue-800 transition m-0 p-0">
                  <Link href={`/profile?id=${encodeURIComponent(author.id)}`} className="hover:underline focus:underline">
                    {author.firstName} {author.lastName}
                  </Link>
                </CardTitle>
                <Badge className={`${getPostTypeColor(postType)} flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 transition-none`} style={{ background: undefined, color: undefined }}>
                  {showEmojiBadge && <span>{getPostTypeEmoji(postType)}</span>}
                  <span>{postType.replace(/_/g, " ")}</span>
                </Badge>
              </div>
              <CardDescription className="text-xs text-gray-500">
                {formatDate(createdAt)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{content}</p>
        <div className="flex gap-6 text-xs sm:text-sm text-gray-600">
          <button className="flex items-center gap-1.5 hover:text-red-500 transition">
            <Heart className="h-4 w-4" /> <span className="hidden sm:inline">{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-500 transition">
            <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">{comments}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
