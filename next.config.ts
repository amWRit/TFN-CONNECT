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
  // Edge runtime compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
}

export default nextConfig
