/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Serverless function configuration
  serverExternalPackages: ['child_process', 'fs', 'path'],
}

module.exports = nextConfig
