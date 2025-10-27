/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Serverless function configuration - externalize Node.js built-ins
  serverExternalPackages: ['child_process', 'fs', 'path'],
  // Try to disable static generation completely
  experimental: {
    dynamicIO: true,
  },
  // Custom webpack configuration
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Externalize Node.js built-ins for serverless functions
      config.externals = [...(config.externals || []), 'child_process', 'fs', 'path']
      
      // Try to prevent error page compilation
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/document': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
