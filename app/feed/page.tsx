"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { PostCard } from "@/components/PostCard"
import NotFound from "@/components/NotFound"
import { PostType } from "@prisma/client"

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
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const postTypeOptions = Object.entries(PostType).map(([key, value]) => ({ key, value }));

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

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent, postType: newPostType }),
      });
      if (!res.ok) throw new Error("Failed to add post");
      setShowModal(false);
      setNewContent("");
      setNewPostType("GENERAL");
      // Refresh posts
      setLoading(true);
      const data = await fetch("/api/feed").then((r) => r.json());
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to add post");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="w-full bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 relative">
          <div className="inline-block mb-0">
            <span className="inline-block bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 text-blue-900 text-2xl font-extrabold px-8 py-3 rounded-full tracking-wide shadow-lg border-2 border-blue-200 animate-fadeIn">✨ FEED ✨</span>
          </div>
          <p className="text-blue-500 text-lg sm:text-2xl max-w-2xl font-semibold mt-2 mb-2 drop-shadow">Recent updates from the TFN community</p>
          {/* Floating Action Button (enabled) */}
          <button
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-500 to-pink-400 text-white rounded-full shadow-2xl p-5 hover:scale-110 transition font-bold text-3xl flex items-center gap-2 border-4 border-white/60"
            title="New Post"
            style={{ boxShadow: '0 4px 24px 0 rgba(80, 80, 200, 0.18)' }}
            onClick={() => setShowModal(true)}
          >
            <span>＋</span> <span className="hidden sm:inline text-lg">New Post</span>
          </button>
        </div>

        {/* Add Post Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xl sm:max-w-2xl border-4 border-blue-400/70 relative animate-fadeIn mx-2">
              <button
                className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Create a Post</h2>
              <form onSubmit={handleAddPost} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3 text-xs text-blue-700">
                  <strong>Tip:</strong> You can use <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Markdown</a> to format your post.<br />
                  <span>Examples: <code>**bold**</code>, <code>*italic*</code>, <code>[link](https://example.com)</code>, <code>- List item</code></span><br />
                  <span className="block mt-1">To add a new line, end a line with two spaces or use a blank line between paragraphs.</span>
                </div>
                <div>
                  <textarea
                    className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
                    rows={4}
                    placeholder="What's on your mind?"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-blue-700">Type</label>
                  <select
                    className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
                    value={newPostType}
                    onChange={e => setNewPostType(e.target.value)}
                  >
                    {postTypeOptions.map(opt => (
                      <option key={opt.key} value={opt.value}>
                        {opt.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center font-semibold">
                    {error}
                  </div>
                )}
                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
                    disabled={submitting || !newContent.trim()}
                  >
                    {submitting ? "Posting..." : "Post"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-7 sm:space-y-10 mt-8">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
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
              hideStats
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 mt-10 shadow-lg">
            <p className="text-gray-600">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  )
}
