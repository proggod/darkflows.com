#!/bin/bash
# Filename: update-runner-config.sh

# 1) Grab the GitLab container’s IP:
gitlab_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' gitlab)

# 2) Update /var/www/runner/data/config.toml to use that IP, preserving https.
sed -i "s|^  url = \".*\"|  url = \"https://${gitlab_ip}\"|g" /var/www/runner/data/config.toml

# 3) Restart the runner container
docker restart gitlab-runner
