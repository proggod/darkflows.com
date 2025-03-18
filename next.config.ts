import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  typescript: {
    ignoreBuildErrors: true
  },
  transpilePackages: ["geist"],
  images: {
    domains: ['localhost'],
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
  server: {
    hostname: '0.0.0.0',
    port: 3050,
    allowHostnames: ['*'],
  },
  serverRuntimeConfig: {
    mongodb: {
      uri: process.env.MONGODB_URI
    }
  },
};

export default nextConfig;
