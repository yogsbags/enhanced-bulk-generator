/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force static export to avoid server-side rendering issues
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Disable trailing slash redirect
  trailingSlash: false,
}

module.exports = nextConfig
