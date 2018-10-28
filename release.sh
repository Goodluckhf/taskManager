#!/usr/bin/env bash
set -e

RELEASE_VERSION=$1 docker-compose -f docker-compose.yml build
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml push
scp docker-compose.yml just1ce@185.249.255.224:~/vk-tasks
scp docker-compose.infra.yml just1ce@185.249.255.224:~/vk-tasks
scp reload.sh just1ce@185.249.255.224:~/vk-tasks
ssh just1ce@185.249.255.224 "cd ~/vk-tasks &&
cat ./docker.pas | docker login --username just1ce --password-stdin &&
RELEASE_VERSION=$1 docker-compose -f docker-compose.yml pull &&
./reload.sh $1"
