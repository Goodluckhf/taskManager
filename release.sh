#!/usr/bin/env bash

RELEASE_VERSION=$1 docker-compose -f docker-compose.yml build
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml push
scp docker-compose.yml just1ce@185.249.255.224:~/vk-tasks
ssh just1ce@185.249.255.224 "cd ~/vk-tasks &&
cat ./docker.pas | docker login --username just1ce --password-stdin &&
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml pull &&
docker-compose -f docker-compose.yml stop cron
docker-compose -f docker-compose.yml stop api
docker-compose -f docker-compose.yml stop task-consumer
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml up -d"
