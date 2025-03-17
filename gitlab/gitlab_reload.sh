#!/bin/bash
export GITLAB_HOME=/raid/gitlab
docker compose down
docker compose up -d

