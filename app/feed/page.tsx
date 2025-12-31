"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { PostCard } from "@/components/PostCard"
import NotFound from "@/components/NotFound"

interface Post {
  id: string
  content: string
  postType: string
  likes: number
  createdAt: string
  person: {
    id: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  comments: Array<{
    id: string
  }>
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/feed")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
        setLoading(false);
      });
  }, [status]);


  if (status === "unauthenticated") {
    return <NotFound />;
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-2 sm:mb-3 relative">
          <div className="inline-block mb-0">
            <span className="inline-block bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 text-blue-900 text-lg font-extrabold px-6 py-2 rounded-full tracking-wide shadow">✨ FEED ✨</span>
          </div>
          <p className="text-blue-500 text-lg sm:text-xl max-w-2xl font-medium">
            Recent updates from the TFN community
          </p>
          {/* Floating Action Button (placeholder) */}
          <button
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-500 to-pink-400 text-white rounded-full shadow-lg p-4 hover:scale-105 transition font-bold text-2xl flex items-center gap-2"
            title="New Post (coming soon)"
            style={{ boxShadow: '0 4px 24px 0 rgba(80, 80, 200, 0.15)' }}
            disabled
          >
            <span>＋</span> <span className="hidden sm:inline">New Post</span>
          </button>
        </div>

        <div className="space-y-5 sm:space-y-7">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              author={{
                id: post.person.id,
                firstName: post.person.firstName,
                lastName: post.person.lastName,
                profileImage: post.person.profileImage,
              }}
              content={post.content}
              postType={post.postType}
              likes={post.likes}
              comments={post.comments.length}
              createdAt={new Date(post.createdAt)}
              showEmojiBadge
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 mt-10">
            <p className="text-gray-600">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  )
}
