/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Experimental features for Next.js 14
  experimental: {
    // Externalize server packages for serverless functions
    serverComponentsExternalPackages: ['child_process'],
  },
}

module.exports = nextConfig
