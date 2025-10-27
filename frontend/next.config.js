/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output configuration for Netlify
  output: 'standalone',
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Experimental Turbopack configuration
  experimental: {
    // Turbopack configuration
    turbo: {
      // Set root directory to handle multiple lockfiles
      root: process.cwd(),
      // Resolve aliases for Turbopack
      resolveAlias: {
        // Allow dynamic imports in API routes
      },
    },
  },
  // Serverless function configuration
  serverExternalPackages: ['child_process', 'fs', 'path'],
  // Webpack configuration (used for production builds)
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Don't bundle Node.js built-ins for server components
      config.externals = [...(config.externals || []), 'child_process', 'fs', 'path']
      
      // Ignore dynamic require warnings for spawn
      config.ignoreWarnings = [
        { module: /node_modules/ },
        { message: /Can't resolve/ },
      ]
    }
    return config
  },
}

module.exports = nextConfig
