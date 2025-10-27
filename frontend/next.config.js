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
    },
  },
  // Webpack configuration fallback (for production builds)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore dynamic requires in API routes
      config.externals = config.externals || []
      config.externals.push({
        // External modules that shouldn't be bundled
        'child_process': 'commonjs child_process',
        'fs': 'commonjs fs',
        'path': 'commonjs path',
      })
    }
    return config
  },
}

module.exports = nextConfig
