#!/bin/bash
set -e

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    npm install
fi

# Run the command passed to docker-compose
exec "$@" 