#!/bin/bash

# Exit on any error
set -e

# Detect which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

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
ENV_FILE=".env.production"  # Always use .env.production for prod

echo "🚀 Deploying in ${ENVIRONMENT} mode using ${COMPOSE_FILE}..."

# Check for environment file
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  ${ENV_FILE} not found. Please create .env.production manually."
    exit 1
fi

echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} down

echo "🧹 Cleaning up..."
docker system prune -f

# Create Docker volumes if they don't exist
echo "📦 Setting up volumes..."
if [ "$ENVIRONMENT" = "prod" ]; then
    # Create directories
    sudo mkdir -p /var/www/darkflows.com/data/db
    sudo mkdir -p /var/www/darkflows.com/public/uploads
    
    # Set proper ownership
    sudo chown -R 999:999 /var/www/darkflows.com/data/db
    sudo chown -R 998:998 /var/www/darkflows.com/public/uploads
    
    # Set proper permissions
    sudo chmod -R 700 /var/www/darkflows.com/data/db
    sudo chmod -R 755 /var/www/darkflows.com/public/uploads
else
    docker volume create mongodb_data_dev || true
    docker volume create uploads_data_dev || true
fi


export RESET_PASSWORD=$(grep RESET_PASSWORD .env.production | cut -d '=' -f2 | tr -d '[:space:]')
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "⬇️ Pulling latest images..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} pull
else
    echo "🏗️ Building local images..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} build
fi

echo "🚀 Starting containers..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} up -d

echo "⏳ Waiting for MongoDB to be ready..."
if [ "$ENVIRONMENT" = "prod" ]; then
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} exec -T mongodb sh -c 'until mongosh --eval "db.adminCommand(\"ping\")" > /dev/null 2>&1; do sleep 1; done'
else
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} exec -T mongodb sh -c 'until mongosh --eval "db.adminCommand(\"ping\")" > /dev/null 2>&1; do sleep 1; done'
fi

echo "✅ Deployment complete!"

# Print connection information
echo "🔌 MongoDB is available at:"
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "  - Internal: mongodb://mongodb:27017"
    echo "  - External: mongodb://localhost:27018"
else
    echo "  - Internal: mongodb://mongodb:27017"
    echo "  - External: mongodb://localhost:27018"
fi

echo "📝 Showing logs..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} logs -f darkflows 