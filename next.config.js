/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Only during build time
  },
  eslint: {
    ignoreDuringBuilds: true, // Only during build time
  },
}

module.exports = nextConfig 