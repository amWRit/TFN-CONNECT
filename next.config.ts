import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // ✅ VERCEL BUILD FIXES
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Tailwind + Vercel optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Use Turbopack for Next.js 15
  turbopack: {},
}

export default nextConfig
