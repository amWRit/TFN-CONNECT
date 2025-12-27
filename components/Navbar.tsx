"use client";

import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  return (
    <nav className="border-b-2 border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="TFN-Connect Logo" 
            className="h-8 w-auto group-hover:opacity-80 transition"
          />
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TFN-Connect</h1>
        </a>
        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm items-center">
          <a href="/" className="text-gray-700 hover:text-blue-600 font-semibold transition">Home</a>
          <a href="/alumni" className="text-gray-700 hover:text-blue-600 font-semibold transition">Alumni</a>
          <a href="/jobs" className="text-gray-700 hover:text-blue-600 font-semibold transition">Jobs</a>
          <a href="/feed" className="text-gray-700 hover:text-blue-600 font-semibold transition">Feed</a>
          <a href="/admin/dashboard?auto=true" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold transition">Admin</a>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
