#!/bin/bash

echo "Running profile verification in Docker..."
docker-compose exec web npx ts-node -r tsconfig-paths/register scripts/verify-profile.ts 