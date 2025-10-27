/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output configuration for Netlify
  output: 'standalone',
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Serverless function configuration - externalize Node.js built-ins
  serverExternalPackages: ['child_process', 'fs', 'path'],
  // Webpack configuration (used when TURBOPACK=0)
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Externalize Node.js built-ins for serverless functions
      config.externals = [...(config.externals || []), 'child_process', 'fs', 'path']
      
      // Ignore warnings about dynamic requires (spawn will work at runtime)
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /node_modules/ },
        { message: /Can't resolve/ },
      ]
    }
    return config
  },
}

module.exports = nextConfig
