"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { UserCircle, LogOut, User, Activity } from "lucide-react";
import Link from "next/link";
import { ProfileImage } from "./ProfileImage";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check admin login from localStorage
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileImage();
    }
  }, [session]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProfileImage = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileImage(data.profileImage);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  if (status === "loading") return null;

  // Admin session: show admin info
  if (isAdmin) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-100 transition"
          aria-label="Admin menu"
        >
          <UserCircle size={24} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
            <div className="px-4 py-3 border-b text-xs text-gray-500">
              <span className="font-semibold text-gray-800">Signed in as admin</span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                localStorage.removeItem("adminAuth");
                localStorage.removeItem("adminEmail");
                window.location.href = "/admin/login";
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 text-gray-700 text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold transition flex items-center gap-2"
      >
        <UserCircle size={20} /> Sign In
      </button>
    );
  }

  const displayName = session.user?.name || session.user?.email || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-100 transition"
        aria-label="User menu"
      >
        {profileImage ? (
          <ProfileImage
            src={profileImage}
            name={displayName}
            className="h-8 w-8 rounded-full border-2 border-blue-200 object-cover"
            alt={displayName}
          />
        ) : (
          <UserCircle size={24} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b text-xs text-gray-500">
            Signed in as<br />
            <span className="font-semibold text-gray-800">{session.user?.email}</span>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
            onClick={() => setOpen(false)}
          >
            <User size={16} /> Profile
          </Link>
          <Link
            href={`/profile/${session.user?.id}/activity`}
            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
            onClick={() => setOpen(false)}
          >
            <Activity size={16} /> My Activity
          </Link>
          <Link
            href="/profile/bookmarks"
            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
            onClick={() => setOpen(false)}
          >
            <span role="img" aria-label="Bookmarks">🔖</span> My Bookmarks
          </Link>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 text-gray-700 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
