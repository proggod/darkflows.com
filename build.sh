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
if ! docker buildx create --name darkflows-builder --use; then
  echo "⚠️ Failed to create builder, but continuing..."
fi

if ! docker buildx inspect --bootstrap; then
  echo "⚠️ Failed to bootstrap builder"
  exit 1
fi

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