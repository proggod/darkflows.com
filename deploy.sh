#!/bin/bash

# Exit on any error
set -e

# Default to development mode
ENVIRONMENT="dev"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -p|--prod) ENVIRONMENT="prod" ;;
        -d|--dev) ENVIRONMENT="dev" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Set the compose file based on environment
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo "🚀 Deploying in ${ENVIRONMENT} mode using ${COMPOSE_FILE}..."

echo "🛑 Stopping existing container..."
docker-compose -f ${COMPOSE_FILE} down

echo "🧹 Cleaning up..."
docker system prune -f

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "⬇️ Pulling latest image..."
    docker-compose -f ${COMPOSE_FILE} pull
else
    echo "🏗️ Building local image..."
    docker-compose -f ${COMPOSE_FILE} build
fi

echo "🚀 Starting container..."
docker-compose -f ${COMPOSE_FILE} up -d

echo "✅ Deployment complete!"
echo "📝 To view logs, run: docker-compose -f ${COMPOSE_FILE} logs -f" 