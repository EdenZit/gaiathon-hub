#!/bin/bash

echo "Stopping Docker containers..."
docker-compose down || true

echo "Checking for stuck containers..."
STUCK_CONTAINERS=$(docker ps -q --filter "name=gaiathon-hub")
if [ ! -z "$STUCK_CONTAINERS" ]; then
  echo "Found stuck containers. Attempting to stop them gracefully..."
  docker stop $STUCK_CONTAINERS || true
  sleep 5
  echo "Forcibly removing any remaining stuck containers..."
  docker rm -f $STUCK_CONTAINERS || true
fi

echo "Pruning Docker system to remove unused resources..."
docker system prune -f

echo "Removing Next.js cache volume..."
docker volume rm gaiathon-hub_next || true

echo "Removing node_modules volume..."
docker volume rm gaiathon-hub_node_modules || true

echo "Cleaning local Next.js cache..."
rm -rf .next || true
rm -rf node_modules/.cache || true

echo "Rebuilding the application with clean cache..."
docker-compose build --no-cache web

echo "Starting the application with conservative settings..."
docker-compose up -d

echo "Waiting for application to start..."
sleep 10

echo "Checking application status..."
docker-compose ps

echo "Cache cleared and application rebuilt successfully!"
echo "If you still experience issues, try restarting Docker Desktop completely." 