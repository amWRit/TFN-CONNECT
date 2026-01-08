"use client";

import UserMenu from "@/components/UserMenu";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("adminAuth") === "true");
    }
  }, []);

  return (
    <nav className="border-b-2 border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="TFN-Connect Logo" 
            className="h-8 w-auto group-hover:opacity-80 transition"
          />
          <h1 className="hidden lg:block text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TFN-Connect</h1>
        </a>
        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm items-center">
              <a href="/people" className="text-gray-700 hover:text-blue-600 font-semibold transition">People</a>
          <a href="/jobs" className="text-gray-700 hover:text-blue-600 font-semibold transition">Jobs</a>
          <a href="/opportunities" className="text-gray-700 hover:text-purple-600 font-semibold transition">Opportunities</a>
          {(session?.user || isAdmin) && (
            <a href="/feed" className="text-gray-700 hover:text-blue-600 font-semibold transition">Feed</a>
          )}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
