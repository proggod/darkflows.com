#!/bin/bash
export GITLAB_HOME=/raid/gitlab


# Pull the latest images as defined in your docker-compose.yml
docker compose pull

# Stop and remove any existing containers
docker compose down

# Start everything back up with the newest images
docker compose up -d


