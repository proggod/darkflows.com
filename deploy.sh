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
ENV_FILE=".env.${ENVIRONMENT}"

echo "🚀 Deploying in ${ENVIRONMENT} mode using ${COMPOSE_FILE}..."

# Check for environment file
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  ${ENV_FILE} not found. Creating from example..."
    cp .env.example "$ENV_FILE"
fi

echo "🛑 Stopping existing containers..."
docker-compose -f ${COMPOSE_FILE} down

echo "🧹 Cleaning up..."
docker system prune -f

# Create Docker volumes if they don't exist
echo "📦 Setting up MongoDB volume..."
if [ "$ENVIRONMENT" = "prod" ]; then
    docker volume create mongodb_data || true
else
    docker volume create mongodb_data_dev || true
fi

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "⬇️ Pulling latest images..."
    docker-compose -f ${COMPOSE_FILE} pull
else
    echo "🏗️ Building local images..."
    docker-compose -f ${COMPOSE_FILE} build
fi

echo "🚀 Starting containers..."
docker-compose -f ${COMPOSE_FILE} up -d

echo "⏳ Waiting for MongoDB to be ready..."
if [ "$ENVIRONMENT" = "prod" ]; then
    docker-compose -f ${COMPOSE_FILE} exec -T mongodb sh -c 'until mongosh --eval "db.adminCommand(\"ping\")" > /dev/null 2>&1; do sleep 1; done'
else
    docker-compose -f ${COMPOSE_FILE} exec -T mongodb-dev sh -c 'until mongosh --eval "db.adminCommand(\"ping\")" > /dev/null 2>&1; do sleep 1; done'
fi

echo "✅ Deployment complete!"
echo "📝 To view logs, run: docker-compose -f ${COMPOSE_FILE} logs -f"

# Print connection information
echo "🔌 MongoDB is available at:"
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "  - Internal: mongodb://mongodb:27017"
    echo "  - External: mongodb://localhost:27017"
else
    echo "  - Internal: mongodb://mongodb-dev:27017"
    echo "  - External: mongodb://localhost:27017"
fi 