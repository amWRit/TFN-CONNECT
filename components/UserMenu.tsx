"use client";

// Extend the Window type to include showAdminPassword
declare global {
  interface Window {
    showAdminPassword?: boolean;
  }
}

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { UserCircle, LogOut, User, Activity, Shield, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileImage } from "./ProfileImage";


export default function UserMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // All hooks at the top, always called in the same order
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [personType, setPersonType] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Modal state for password prompt
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminToggleActive, setAdminToggleActive] = useState(false);
  // Add missing admin modal state
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  useEffect(() => {
    // Check admin login from localStorage
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");

      // Listen for storage changes (cross-tab)
      const handleStorage = (event: StorageEvent) => {
        if (event.key === "adminAuth") {
          setIsAdmin(event.newValue === "true");
        }
      };
      window.addEventListener("storage", handleStorage);

      // Listen for custom event (same tab)
      const handleCustom = () => {
        setIsAdmin(localStorage.getItem("adminAuth") === "true");
      };
      window.addEventListener("adminAuthChanged", handleCustom);

      // Poll as fallback (in case setItem doesn't trigger event)
      let lastAuth = localStorage.getItem("adminAuth");
      const poll = setInterval(() => {
        const current = localStorage.getItem("adminAuth");
        if (current !== lastAuth) {
          setIsAdmin(current === "true");
          lastAuth = current;
        }
      }, 500);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("adminAuthChanged", handleCustom);
        clearInterval(poll);
      };
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileImage();
      fetchPersonType();
    }
  }, [session]);

  // Fetch Person.type for current user
  async function fetchPersonType() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setPersonType(data.type || null);
      }
    } catch (error) {
      setPersonType(null);
    }
  }

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

  // Only show admin UI if admin session is active
  if (isAdmin) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-100 transition"
          aria-label="Admin menu"
        >
          <span className="h-8 w-8 flex items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-50">
            <Shield size={22} className="text-yellow-700" />
          </span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
            <div className="px-4 py-3 border-b text-xs text-gray-500">
              <span className="font-semibold text-gray-800">Admin session active</span>
            </div>
            <Link
              href="/admin/home"
              className="flex items-center gap-2 px-4 py-2 text-green-700 font-semibold hover:bg-green-50 border-b border-gray-100"
              onClick={() => setOpen(false)}
            >
              <Shield size={16} /> Admin Panel
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                localStorage.removeItem("adminAuth");
                window.location.href = "/feed";
              }}
              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 text-gray-700 text-sm"
            >
              <LogOut size={16} /> Admin Logout
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

  // Show Admin Panel toggle if ADMIN or STAFF_ADMIN
  const showAdminPanel = personType === "ADMIN" || personType === "STAFF_ADMIN";
  const isAlumni = personType === "ALUMNI";

  // Handle admin toggle
  const handleAdminToggle = async () => {
    if (isAdmin) {
      // Turn off admin session
      localStorage.removeItem("adminAuth");
      setIsAdmin(false);
      setOpen(false);
      router.refresh();
    } else {
      // Keep toggle visually on while modal is open
      setAdminToggleActive(true);
      setShowAdminModal(true);
    }
  };

  // Handle admin password submit
  const handleAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPassword }),
    });
    const data = await res.json();
    setAdminLoading(false);
    if (data.success) {
      localStorage.setItem("adminAuth", "true");
      window.dispatchEvent(new Event("adminAuthChanged"));
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPassword("");
      setOpen(false);
      setAdminToggleActive(false); // turn off visual toggle
      router.refresh();
    } else {
      setAdminError(data.error || "Login failed");
    }
  };

  // When modal closes/cancels, turn off visual toggle
  const handleAdminModalClose = () => {
    setShowAdminModal(false);
    setAdminToggleActive(false);
  };

  const displayName = session.user?.name || session.user?.email || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-100 transition"
        aria-label="User menu"
      >
        {isAdmin ? (
          <Shield size={28} className="text-yellow-700" />
        ) : profileImage ? (
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
          {/* Admin Panel toggle button and Dashboard link */}
          {showAdminPanel && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className={isAdmin ? "text-yellow-700" : "text-gray-400"} />
                  <span className={`text-sm font-semibold ${isAdmin ? "text-yellow-800" : "text-yellow-700"}`}>Admin Mode</span>
                </div>
                <div className="group relative flex-shrink-0">
                  <button
                    onClick={handleAdminToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isAdmin ? "bg-green-500" : adminToggleActive ? "bg-blue-500" : "bg-gray-300"}`}
                    aria-pressed={isAdmin || adminToggleActive}
                    aria-label="Toggle admin mode"
                  >
                    <span className="sr-only">Toggle admin mode</span>
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${isAdmin || adminToggleActive ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-8 z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    Toggle admin mode
                  </span>
                </div>
              </div>
              {/* Show Admin Panel link if admin mode is active */}
              {isAdmin && (
                <Link
                  href="/admin/home"
                  className="flex items-center gap-2 px-4 py-2 text-green-700 font-semibold hover:bg-green-50 border-t border-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <Shield size={16} /> Admin Panel
                </Link>
              )}
            </>
          )}
          {/* Admin password modal */}
          {showAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded-full focus:outline-none"
                  onClick={handleAdminModalClose}
                  aria-label="Close"
                  disabled={adminLoading}
                >
                  <X size={20} />
                </button>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-yellow-700" /> Enter Admin Password
                </h2>
                <form onSubmit={handleAdminPassword}>
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded px-3 py-2 mb-2 transition"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    autoFocus
                  />
                  {adminError && <div className="text-red-500 text-sm mb-2">{adminError}</div>}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="show-admin-password"
                      checked={showAdminPassword}
                      onChange={() => setShowAdminPassword(v => !v)}
                    />
                    <label htmlFor="show-admin-password" className="text-sm">Show password</label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex-1 flex items-center justify-center gap-2 shadow"
                      disabled={adminLoading}
                    >
                      <Shield size={16} />
                      {adminLoading ? "Logging in..." : "Login"}
                    </button>
                    <button
                      type="button"
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-400 px-4 py-2 rounded font-semibold flex-1 flex items-center justify-center gap-2 transition-colors"
                      onClick={handleAdminModalClose}
                      disabled={adminLoading}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 text-gray-700 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
