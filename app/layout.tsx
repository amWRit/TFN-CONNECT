import "@/styles/globals.css"

import type { Metadata } from "next"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "TFN-Connect",
  description: "Alumni network, job board, and community platform for Teach For Nepal ecosystem",
  icons: [
    { rel: "icon", url: "/logos/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/logos/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/logos/favicon-16x16.png" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/logos/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/logos/android-chrome-192x192.png" },
    { rel: "icon", type: "image/png", sizes: "512x512", url: "/logos/android-chrome-512x512.png" },
  ],
  manifest: "/logos/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
