/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Output standalone for better Netlify compatibility
  output: 'standalone',
  // Serverless function configuration - externalize Node.js built-ins
  serverExternalPackages: ['child_process', 'fs', 'path'],
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
