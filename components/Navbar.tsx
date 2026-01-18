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

  // General user nav links (for both top and bottom nav)
  const navLinks = [
    {
      href: "/people",
      icon: <Users className="h-5 w-5" />, // slightly larger for bottom nav
      label: "Community",
      active: isActive("/people") || pathname === "/profile" || pathname?.startsWith("/profile/")
    },
    {
      href: "/jobs",
      icon: <Briefcase className="h-5 w-5" />,
      label: "Jobs",
      active: isActive("/jobs")
    },
    {
      href: "/opportunities",
      icon: <Rocket className="h-5 w-5" />,
      label: "Opportunities",
      active: isActive("/opportunities")
    },
    {
      href: "/events",
      icon: <Calendar className="h-5 w-5" />,
      label: "Events",
      active: isActive("/events")
    },
    {
      href: "/feed",
      icon: <Activity className="h-5 w-5" />,
      label: "Feed",
      active: isActive("/feed"),
      show: session?.user || isAdmin
    }
  ];

  // Hide bottom nav on admin panel (mobile)
  const isAdminHome = pathname === "/admin/home";

  return (
    <>
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
            {/* Top nav links: show on sm+ screens */}
            <div className="hidden sm:flex gap-3 sm:gap-6 items-stretch">
              {navLinks.map((link, i) => {
                if (link.label === "Feed" && !(session?.user || isAdmin)) return null;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`font-semibold transition flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${
                      link.active
                        ? link.label === "Community"
                          ? "text-cyan-600 border-b-2 border-cyan-600"
                          : link.label === "Jobs"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : link.label === "Opportunities"
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : link.label === "Events"
                          ? "text-emerald-600 border-b-2 border-emerald-600"
                          : link.label === "Feed"
                          ? "text-pink-600 border-b-2 border-pink-600"
                          : ""
                        : "text-gray-700 hover:text-blue-600 border-b-2 border-transparent"
                    }`}
                    title={link.label}
                  >
                    {link.icon}
                    <span className="hidden sm:inline">{link.label}</span>
                  </a>
                );
              })}
            </div>
            <div className={`flex items-center gap-1 py-3 sm:py-4 -mb-0.5 ${isAdmin && pathname === "/admin/home" ? "border-b-2 border-yellow-700" : ""}`}>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      {/* Floating bottom nav for general users: only on mobile, not on admin panel */}
      {!isAdminHome && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden justify-around bg-white/95 border-t-2 border-blue-400 shadow-lg h-14 px-2">
          {navLinks.map((link, i) => {
            if (link.label === "Feed" && !(session?.user || isAdmin)) return null;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center justify-center px-2 h-full w-full transition-colors ${
                  link.active
                    ? 'text-white'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
                title={link.label}
                style={{ minWidth: '56px' }}
              >
                {link.active && (
                  <span
                    className={`absolute left-0 top-0 w-full h-full -z-10 ${
                      link.label === 'Community'
                        ? 'bg-cyan-600'
                        : link.label === 'Jobs'
                        ? 'bg-blue-600'
                        : link.label === 'Opportunities'
                        ? 'bg-purple-600'
                        : link.label === 'Events'
                        ? 'bg-emerald-600'
                        : link.label === 'Feed'
                        ? 'bg-pink-600'
                        : ''
                    } shadow`}
                  />
                )}
                {link.icon}
                {/* Optionally show label below icon on mobile: <span className="text-xs mt-0.5">{link.label}</span> */}
              </a>
            );
          })}
        </nav>
      )}
    </>
  );
}
