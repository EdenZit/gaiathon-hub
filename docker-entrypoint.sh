#!/bin/sh
set -e

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set Node.js performance optimizations
export NODE_OPTIONS="--max-old-space-size=4096 --max-http-header-size=16384 --no-warnings"

# Run the command passed to docker-compose
exec "$@" 