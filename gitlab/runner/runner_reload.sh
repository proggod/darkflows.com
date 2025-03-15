#!/bin/bash
set -e

# Detect which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

COMPOSE_FILE="gitlabrunner.yml"

echo "Stopping existing GitLab Runner..."
$DOCKER_COMPOSE -f "$COMPOSE_FILE" down || true

echo "Starting GitLab Runner..."
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d

echo "Done. Current status:"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" ps


