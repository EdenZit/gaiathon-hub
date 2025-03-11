#!/bin/bash

# Script to toggle maintenance mode on the GAIAthon Hub server
# Usage: ./server-toggle-maintenance.sh [on|off] [directory]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
  echo -e "${YELLOW}Usage: $0 [on|off] [directory]${NC}"
  echo "  on|off     - Enable or disable maintenance mode"
  echo "  directory  - Optional: Path to the application directory (default: current directory)"
  exit 1
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
  usage
fi

# Get the mode (on/off)
MODE=$1

# Get the directory (default to current directory)
APP_DIR="."
if [ $# -ge 2 ]; then
  APP_DIR="$2"
fi

# Check if the directory exists
if [ ! -d "$APP_DIR" ]; then
  echo -e "${RED}Error: Directory '$APP_DIR' does not exist${NC}"
  exit 1
fi

# Check if .env.production exists in the specified directory
if [ ! -f "$APP_DIR/.env.production" ]; then
  echo -e "${RED}Error: .env.production file not found in '$APP_DIR'${NC}"
  exit 1
fi

# Toggle maintenance mode based on argument
case "$MODE" in
  on)
    echo -e "${YELLOW}Enabling maintenance mode...${NC}"
    # Update .env.production file
    sed -i 's/MAINTENANCE_MODE=false/MAINTENANCE_MODE=true/' "$APP_DIR/.env.production"
    
    # Restart the Docker container
    echo -e "${YELLOW}Restarting the application...${NC}"
    cd "$APP_DIR" && docker-compose restart web
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Maintenance mode enabled successfully!${NC}"
      echo -e "The site is now in maintenance mode. Only admins can access it."
    else
      echo -e "${RED}Failed to restart the application.${NC}"
      exit 1
    fi
    ;;
    
  off)
    echo -e "${YELLOW}Disabling maintenance mode...${NC}"
    # Update .env.production file
    sed -i 's/MAINTENANCE_MODE=true/MAINTENANCE_MODE=false/' "$APP_DIR/.env.production"
    
    # Restart the Docker container
    echo -e "${YELLOW}Restarting the application...${NC}"
    cd "$APP_DIR" && docker-compose restart web
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Maintenance mode disabled successfully!${NC}"
      echo -e "The site is now accessible to all users."
    else
      echo -e "${RED}Failed to restart the application.${NC}"
      exit 1
    fi
    ;;
    
  *)
    usage
    ;;
esac

echo -e "${YELLOW}Note: It may take a few moments for the changes to take effect.${NC}"
exit 0 