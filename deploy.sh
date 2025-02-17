#!/bin/bash

#hello


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
        -p|--prod) ENVIRONMENT="production" ;;
        -d|--dev) ENVIRONMENT="dev" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Set the compose file based on environment
COMPOSE_FILE="docker-compose.${ENVIRONMENT/production/prod}.yml"
ENV_FILE=".env.${ENVIRONMENT}"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    echo "📝 Loading environment variables from ${ENV_FILE}"
    set -a # automatically export all variables
    source "$ENV_FILE"
    set +a
else
    echo "⚠️  ${ENV_FILE} not found. Creating from example..."
    cp "sample.env.${ENVIRONMENT}" "$ENV_FILE"
    echo "⚠️  Please edit ${ENV_FILE} with your configuration"
    exit 1
fi

# Verify required environment variables
required_vars=(
    "MONGODB_URI" 
    "JWT_SECRET" 
    "RESET_PASSWORD"
    "MONGO_INITDB_ROOT_USERNAME"
    "MONGO_INITDB_ROOT_PASSWORD"
)
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in ${ENV_FILE}"
        exit 1
    fi
done

echo "🚀 Deploying in ${ENVIRONMENT} mode using ${COMPOSE_FILE}..."

echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} down

echo "🧹 Cleaning up..."
# Modified to keep build cache
docker system prune -f --filter "until=24h"

# Create Docker volumes if they don't exist
echo "📦 Setting up volumes..."
if [ "$ENVIRONMENT" = "prod" ]; then
    # Create directories with proper permissions
    sudo mkdir -p /var/www/darkflows.com/data/db
    sudo mkdir -p /var/www/darkflows.com/public/uploads
    
    sudo chown -R 999:999 /var/www/darkflows.com/data/db
    sudo chown -R 998:www-data /var/www/darkflows.com/public/uploads
    
    sudo chmod -R 700 /var/www/darkflows.com/data/db
    sudo chmod -R 775 /var/www/darkflows.com/public/uploads
else
    docker volume create mongodb_data_dev || true
    docker volume create node_modules || true
    docker volume create next-cache || true
fi

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "⬇️ Pulling latest images..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} pull
    
    # Verify environment variables are loaded
    echo "🔍 Verifying environment variables..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} config | grep MONGODB_URI || echo "⚠️  Warning: MONGODB_URI not found in compose config"
else
    echo "🏗️ Building local images..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} build
fi

echo "🔍 Verifying environment variables..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} config | grep -E "JWT_SECRET|RESET_PASSWORD|MONGODB_URI|MONGO_INITDB_ROOT" || {
    echo "❌ Error: Required environment variables are not properly set in docker-compose config"
    exit 1
}

echo "🚀 Starting containers..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} up -d

echo "⏳ Waiting for MongoDB to be ready..."
sleep 15

# Verify MongoDB connection
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🔌 Verifying MongoDB connection..."
    $DOCKER_COMPOSE -f ${COMPOSE_FILE} exec -T mongodb mongosh --eval "db.adminCommand('ping')" || echo "⚠️  Warning: MongoDB not responding"
fi

echo "✅ Deployment complete!"

# Print connection information
echo "🔌 MongoDB is available at:"
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "  - Internal: mongodb://mongodb:27017"
else
    echo "  - Internal: mongodb://mongodb:27017"
    echo "  - External: mongodb://localhost:27018"
fi

echo "📝 Showing logs..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} logs -f darkflows 