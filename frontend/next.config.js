/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output configuration for Netlify
  output: 'standalone',
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
