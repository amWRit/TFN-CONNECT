import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";

interface PostProps {
  author: {
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
      return "bg-green-100 text-green-800";
    case "job_posting":
      return "bg-blue-100 text-blue-800";
    case "career_update":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PostCard({
  author,
  content,
  postType,
  likes,
  comments,
  createdAt,
}: PostProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="border-gray-100 bg-white hover:shadow-md hover:border-blue-200 transition rounded-xl\">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3\">
          <div className="flex items-start gap-3 flex-1\">
            {author.profileImage && (
              <img
                src={author.profileImage}
                alt={author.firstName}
                className=\"h-10 w-10 rounded-full flex-shrink-0\"
              />
            )}
            <div className=\"min-w-0 flex-1\">
              <CardTitle className=\"text-base text-gray-900\">
                {author.firstName} {author.lastName}
              </CardTitle>
              <CardDescription className=\"text-xs text-gray-500\">
                {formatDate(createdAt)}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getPostTypeColor(postType)} flex-shrink-0 text-xs\"}>
            {postType.replace(/_/g, \" \")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className=\"text-sm text-gray-700 mb-4 leading-relaxed\">{content}</p>
        <div className=\"flex gap-6 text-xs sm:text-sm text-gray-600\">
          <button className=\"flex items-center gap-1.5 hover:text-red-500 transition\">
            <Heart className=\"h-4 w-4\" /> <span className=\"hidden sm:inline\">{likes}</span>
          </button>
          <button className=\"flex items-center gap-1.5 hover:text-blue-500 transition\">
            <MessageCircle className=\"h-4 w-4\" /> <span className=\"hidden sm:inline\">{comments}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
