"use client";

import UserMenu from "@/components/UserMenu";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Briefcase, Rocket, Calendar, Activity, Users } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");
    }
  }, []);

  const isActive = (path: string) => {
    if (path === "/people") {
      return (
        pathname === "/people" ||
        pathname?.startsWith("/people/") ||
        pathname === "/alumni" ||
        pathname?.startsWith("/alumni/") ||
        pathname === "/profile" ||
        pathname?.startsWith("/profile/")
      );
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <nav className="border-b-2 border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group py-3 sm:py-4">
          <img 
            src="/logo.png" 
            alt="TFN-Connect Logo" 
            className="h-8 w-auto group-hover:opacity-80 transition"
          />
          <h1 className="hidden lg:block text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TFN-Connect</h1>
        </a>
        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm items-stretch h-full">
          <a 
            href="/people"
            className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${
              isActive("/people") || pathname === "/profile" || pathname?.startsWith("/profile/")
                ? "text-cyan-600 border-b-2 border-cyan-600"
                : "text-gray-700 hover:text-cyan-600 border-b-2 border-transparent"
            }`}
            title="Community"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Community</span>
          </a>
          <a 
            href="/jobs" 
            className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isActive("/jobs") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-600 border-b-2 border-transparent"}`} 
            title="Jobs"
          >
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Jobs</span>
          </a>
          <a 
            href="/opportunities" 
            className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isActive("/opportunities") ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700 hover:text-purple-600 border-b-2 border-transparent"}`} 
            title="Opportunities"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Opportunities</span>
          </a>
          <a 
            href="/events" 
            className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isActive("/events") ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-700 hover:text-emerald-600 border-b-2 border-transparent"}`} 
            title="Events"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </a>
          {(session?.user || isAdmin) && (
            <a 
              href="/feed" 
              className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isActive("/feed") ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-700 hover:text-pink-600 border-b-2 border-transparent"}`} 
              title="Feed"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </a>
          )}
          <div className={`flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isAdmin && pathname === "/admin/home" ? "border-b-2 border-yellow-700" : ""}`}>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
