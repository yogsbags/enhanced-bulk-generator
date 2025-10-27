/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Serverless function configuration - externalize Node.js built-ins
  serverExternalPackages: ['child_process', 'fs', 'path'],
  // Skip building error pages during static generation
  experimental: {
    // This helps with Netlify deployment
    skipTrailingSlashRedirect: true,
  },
  // Custom webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Node.js built-ins for serverless functions
      config.externals = [...(config.externals || []), 'child_process', 'fs', 'path']
    }
    return config
  },
}

module.exports = nextConfig
