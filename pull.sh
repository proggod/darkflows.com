#!/bin/bash
export COMPOSE_FILE=docker-compose.prod.yml
docker-compose pull  # Will use prod config

