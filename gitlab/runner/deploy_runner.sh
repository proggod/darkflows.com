#!/bin/bash

# Exit on any error
set -e

# Detect which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Define GitLab Runner config directory
CONFIG_DIR="/var/www/runner/data"

# Define GitLab Runner details
GITLAB_URL="https://gitlab.darkflows.com"
GITLAB_TOKEN="glrt-t1__rzyY2E2PC5xQ-o4UJP7"
RUNNER_NAME="local-runner"
DOCKER_IMAGE="node:18-alpine"
COMPOSE_FILE="gitlabrunner.yml"

echo "Deploying GitLab Runner using ${COMPOSE_FILE}..."

# Ensure the config directory exists
echo "Ensuring config directory exists at ${CONFIG_DIR}..."
mkdir -p "${CONFIG_DIR}"
chmod -R 777 "${CONFIG_DIR}"

# Stop existing runner if it's running
echo "Stopping existing GitLab Runner..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} down || true

echo "Cleaning up old containers and unused resources..."
docker system prune -f || true

echo "Pulling latest GitLab Runner image..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} pull

echo "Starting GitLab Runner..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} up -d

# Wait for the runner to start
sleep 5

# Check if the runner is already registered
if docker exec -it gitlab-runner gitlab-runner list | grep -q "${RUNNER_NAME}"; then
    echo "GitLab Runner '${RUNNER_NAME}' is already registered."
else
    echo "Registering GitLab Runner '${RUNNER_NAME}'..."
    docker exec -it gitlab-runner gitlab-runner register \
      --url "${GITLAB_URL}" \
      --registration-token "${GITLAB_TOKEN}" \
      --executor "docker" \
      --description "${RUNNER_NAME}" \
      --docker-image "${DOCKER_IMAGE}" \
      --run-untagged="true" \
      --locked="false"

    echo "Registration complete"
fi

# Restart the runner to apply any changes
echo "Restarting GitLab Runner..."
docker restart gitlab-runner

# Show runner status
echo "Checking GitLab Runner list..."
docker exec -it gitlab-runner gitlab-runner list

# Print logs
echo "Showing GitLab Runner logs..."
$DOCKER_COMPOSE -f ${COMPOSE_FILE} logs -f gitlab-runner

