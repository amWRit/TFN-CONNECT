import "@/styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TFN-Connect | LinkedIn for Teach For Nepal",
  description: "Alumni network, job board, and community platform for Teach For Nepal ecosystem",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <nav className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
              <h1 className="text-xl font-bold">TFN-Connect</h1>
            </div>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-600">Home</a>
              <a href="/alumni" className="hover:text-blue-600">Alumni</a>
              <a href="/jobs" className="hover:text-blue-600">Jobs</a>
              <a href="/feed" className="hover:text-blue-600">Feed</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
