#!/usr/bin/env bash
set -e

docker-compose -f docker-compose.yml stop cron
COMPOSE_HTTP_TIMEOUT=300 docker-compose -f docker-compose.yml stop api
COMPOSE_HTTP_TIMEOUT=300 docker-compose -f docker-compose.yml stop task-consumer
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml up -d
sleep 2
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml restart nginx
sleep 4
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml restart cron

RELEASE_VERSION=$1 docker-compose -f docker-compose.push.yml up -d
