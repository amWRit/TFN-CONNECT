"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession, signIn } from "next-auth/react"
import { PostCard } from "@/components/PostCard"
import NotFound from "@/components/NotFound"
import { PostType } from "@prisma/client"
import { EditPostModal } from "@/components/EditPostModal"

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
  // Track both session admin and local admin
  const [localAdmin, setLocalAdmin] = useState(() => typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true');
  useEffect(() => {
    function syncAdmin() {
      setLocalAdmin(typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true');
    }
    window.addEventListener('storage', syncAdmin);
    window.addEventListener('focus', syncAdmin);
    return () => {
      window.removeEventListener('storage', syncAdmin);
      window.removeEventListener('focus', syncAdmin);
    };
  }, []);
  // Only allow admin if type is ADMIN or STAFF_ADMIN AND adminAuth is set
  const personType = (session?.user as any)?.type;
  const isSessionAdmin = personType === 'ADMIN' || personType === 'STAFF_ADMIN';
  const isAdmin = isSessionAdmin && localAdmin;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPostType, setEditPostType] = useState("GENERAL");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [editAction, setEditAction] = useState<"save" | "delete" | null>(null);

  const postTypeOptions = Object.entries(PostType).map(([key, value]) => ({ key, value }));
  const [selectedPostType, setSelectedPostType] = useState<string>("");

  const filteredPosts = useMemo(() => {
    if (!selectedPostType) return posts;
    return posts.filter(p => p.postType === selectedPostType);
  }, [posts, selectedPostType]);

  useEffect(() => {
    // allow fetch if signed-in via NextAuth OR if running as local admin
    if (status !== "authenticated" && !isAdmin) return;
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
  }, [status, isAdmin]);

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

  // Handler to open edit modal
  const handleEdit = (post: Post) => {
    setEditPost(post);
    setEditContent(post.content);
    setEditPostType(post.postType);
    setEditError("");
  };
  // Handler to save edit
  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditAction("save");
    setEditSubmitting(true);
    setEditError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (localStorage.getItem('adminAuth') === 'true') {
        headers['x-admin-auth'] = 'true';
      }
      const res = await fetch(`/api/feed/${editPost?.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ content: editContent, postType: editPostType }),
      });
      if (!res.ok) throw new Error("Failed to update post");
      setEditPost(null);
      // Refresh posts
      setLoading(true);
      const data = await fetch("/api/feed").then((r) => r.json());
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to update post");
    } finally {
      setEditSubmitting(false);
      setEditAction(null);
    }
  };
  // Handler to delete post
  const handleEditDelete = async () => {
    if (!editPost) return;
    setEditAction("delete");
    setEditSubmitting(true);
    setEditError("");
    try {
      const headers: Record<string, string> = {};
      if (localStorage.getItem('adminAuth') === 'true') {
        headers['x-admin-auth'] = 'true';
      }
      const res = await fetch(`/api/feed/${editPost.id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Failed to delete post");
      setEditPost(null);
      // Refresh posts
      setLoading(true);
      const data = await fetch("/api/feed").then((r) => r.json());
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to delete post");
    } finally {
      setEditSubmitting(false);
      setEditAction(null);
    }
  };

  // If neither authenticated via NextAuth nor local admin, show NotFound
  if (status === "unauthenticated" && !isAdmin) {
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
    <div className="w-full bg-gradient-to-br from-blue-100 via-white to-blue-200 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header Section */}
        <div className="mb-2 sm:mb-3 relative flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="inline-block mb-0">
              <span className="inline-block bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 text-blue-900 text-base sm:text-2xl font-extrabold px-4 sm:px-8 py-2 sm:py-3 rounded-full tracking-wide shadow-lg border-2 border-blue-200 animate-fadeIn">✨ FEED ✨</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="hidden sm:inline font-semibold text-blue-700">Type</label>
            <select
              className="border border-blue-300 rounded px-2 sm:px-3 py-1 sm:py-2 bg-white/90 font-semibold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm sm:text-base"
              value={selectedPostType}
              onChange={e => setSelectedPostType(e.target.value)}
            >
              <option value="">All</option>
              {postTypeOptions.map(opt => (
                <option key={opt.key} value={opt.value}>{opt.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
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
              <div className="mb-4 text-sm text-gray-700 text-center bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
                By posting, you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-semibold">Terms and Conditions</a>.
              </div>
              <form onSubmit={handleAddPost} className="space-y-6">
                <div className="text-xs text-gray-500 mt-1 italic">
                  Tip: You can use Markdown to format your post.<br />
                  Supports **bold**, _italics_, headings, ordered and unordered lists.<br />
                  Try <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Live Preview</a> or the <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className="underline text-purple-600">Markdown Guide</a> for syntax and examples.
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

        {/* Edit Post Modal */}
        <EditPostModal
          open={!!editPost}
          editContent={editContent}
          editPostType={editPostType}
          postTypeOptions={postTypeOptions}
          editError={editError}
          editSubmitting={editSubmitting}
          editAction={editAction}
          onClose={() => setEditPost(null)}
          onSubmit={handleEditSave}
          onDelete={handleEditDelete}
          onChangeContent={setEditContent}
          onChangeType={setEditPostType}
        />

        <div className="space-y-3 sm:space-y-4 mt-4">
          {filteredPosts.map((post) => (
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
              hideBookmark={false}
              adminView={isAdmin}
              onEdit={isAdmin ? () => handleEdit(post) : undefined}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 mt-6 shadow-lg">
            <p className="text-gray-600">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* Floating Add New Post Button (only if signed in and NOT admin) */}
      {session && !isAdmin && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 sm:bottom-8 right-8 z-50 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-lg font-semibold transition-all duration-200"
          title="Add New Post"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="hidden sm:inline">New Post</span>
        </button>
      )}
    </div>
  )
}
