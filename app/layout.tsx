import "@/styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TFN-Connect",
  description: "Alumni network, job board, and community platform for Teach For Nepal ecosystem",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50">
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
            <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm">
              <a href="/" className="text-gray-700 hover:text-blue-600 font-semibold transition">Home</a>
              <a href="/alumni" className="text-gray-700 hover:text-blue-600 font-semibold transition">Alumni</a>
              <a href="/jobs" className="text-gray-700 hover:text-blue-600 font-semibold transition">Jobs</a>
              <a href="/feed" className="text-gray-700 hover:text-blue-600 font-semibold transition">Feed</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
