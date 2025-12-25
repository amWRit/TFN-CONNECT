"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/PostCard"

interface Post {
  id: string
  content: string
  postType: string
  likes: number
  createdAt: string
  person: {
    firstName: string
    lastName: string
    profileImage?: string
  }
  comments: Array<{
    id: string
  }>
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/feed")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err)
        setPosts([])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-neutral-900">Activity Feed</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Recent updates from the TFN community
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              author={post.person}
              content={post.content}
              postType={post.postType}
              likes={post.likes}
              comments={post.comments.length}
              createdAt={new Date(post.createdAt)}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  )
}
