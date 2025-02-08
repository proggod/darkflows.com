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
    cp sample.env.production .env.production
fi

echo "🏗️ Building multi-platform image..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --no-cache \
  --pull \
  -t proggod/darkflows-web:latest \
  --push \
  .

echo "🧹 Cleaning up builder..."
docker buildx rm darkflows-builder

echo "✅ Build complete!"


# Make sure the file exists and has content

# Start the containers with the environment file
# docker compose -f docker-compose.prod.yml up -d

# echo "Verifying container environment:"
# docker exec darkflows printenv | grep JWT_SECRET

export JWT_SECRET="gfgd09809fd8g90dfg8df09g8gdf098g098" 