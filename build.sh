#!/bin/bash

# Exit on any error
set -e

echo "🧹 Cleaning up..."
rm -rf .next
rm -rf node_modules

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Setting up builder..."
docker buildx create --name darkflows-builder --use || true
docker buildx inspect --bootstrap

echo "🏗️ Building amd64 image..."
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  --pull \
  -t proggod/darkflows-web:latest \
  --push \
  .

echo "🧹 Cleaning up builder..."
docker buildx rm darkflows-builder

echo "✅ Build complete!" 