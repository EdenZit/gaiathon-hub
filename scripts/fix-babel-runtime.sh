#!/bin/bash

# Script to fix @babel/runtime vulnerability before Docker build
# Usage: ./fix-babel-runtime.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing @babel/runtime vulnerability...${NC}"

# Install the latest version of @babel/runtime
npm install --save @babel/runtime@latest

echo -e "${GREEN}Fixed @babel/runtime vulnerability!${NC}"
echo -e "You can now run your Docker build."

exit 0 