#!/bin/bash

# Exit on any error
set -e

echo "🧹 Cleaning up..."
rm -rf .next
rm -rf node_modules

echo "📦 Installing dependencies..."
# Remove package-lock.json if it exists
rm -f package-lock.json
# Run npm install instead of npm ci to generate a new package-lock.json
npm install

echo "🔧 Setting up builder..."
docker buildx create --name darkflows-builder --use || true
docker buildx inspect --bootstrap

# Add environment check and file
echo "📝 Checking environment files..."
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production file not found. Creating from example..."
    cp .env.example .env.production
fi

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