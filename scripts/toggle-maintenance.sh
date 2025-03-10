#!/bin/bash

# Script to toggle maintenance mode on the GAIAthon Hub platform
# Usage: ./toggle-maintenance.sh [on|off]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Function to display usage
usage() {
  echo -e "${YELLOW}Usage: $0 [on|off]${NC}"
  echo "  on  - Enable maintenance mode"
  echo "  off - Disable maintenance mode"
  exit 1
}

# Check if argument is provided
if [ $# -ne 1 ]; then
  usage
fi

# Get the current directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Go to the parent directory (project root)
cd "$SCRIPT_DIR/.."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo -e "${RED}Error: .env.production file not found${NC}"
  exit 1
fi

# Toggle maintenance mode based on argument
case "$1" in
  on)
    echo -e "${YELLOW}Enabling maintenance mode...${NC}"
    # Update .env.production file
    sed -i 's/MAINTENANCE_MODE=false/MAINTENANCE_MODE=true/' .env.production
    
    # Restart the Docker container
    echo -e "${YELLOW}Restarting the application...${NC}"
    docker-compose restart web
    
    echo -e "${GREEN}Maintenance mode enabled successfully!${NC}"
    echo -e "The site is now in maintenance mode. Only admins can access it."
    ;;
    
  off)
    echo -e "${YELLOW}Disabling maintenance mode...${NC}"
    # Update .env.production file
    sed -i 's/MAINTENANCE_MODE=true/MAINTENANCE_MODE=false/' .env.production
    
    # Restart the Docker container
    echo -e "${YELLOW}Restarting the application...${NC}"
    docker-compose restart web
    
    echo -e "${GREEN}Maintenance mode disabled successfully!${NC}"
    echo -e "The site is now accessible to all users."
    ;;
    
  *)
    usage
    ;;
esac

echo -e "${YELLOW}Note: It may take a few moments for the changes to take effect.${NC}"
exit 0 