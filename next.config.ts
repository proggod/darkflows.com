import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['*']
    },
    turbo: {
      rules: {
        // Configure SVG handling for Turbopack
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  // Add this section to handle MongoDB connection
  serverRuntimeConfig: {
    mongodb: {
      uri: process.env.MONGODB_URI
    }
  }
};

export default nextConfig;
