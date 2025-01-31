import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For static export
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  // Add Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        // Configure SVG handling for Turbopack
        '*.svg': {
          loaders: ['@svgr/webpack'],
        },
      },
    },
  },
};

export default nextConfig;
