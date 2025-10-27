/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Try export mode to avoid server-side rendering issues
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Disable trailing slash redirect
  trailingSlash: false,
  // Generate only essential pages
  generateBuildId: () => 'build',
}

module.exports = nextConfig
