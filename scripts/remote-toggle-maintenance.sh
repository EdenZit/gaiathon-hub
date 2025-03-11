#!/bin/bash

# Script to toggle maintenance mode on the remote GAIAthon Hub server
# Usage: ./remote-toggle-maintenance.sh [on|off]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_USER="root"
SERVER_IP="5.22.218.179"
SSH_KEY="$HOME/.ssh/gaiathon_upcloud"
APP_DIR="/var/www/gaiathon-hub"

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

# Toggle maintenance mode based on argument
case "$1" in
  on)
    echo -e "${YELLOW}Enabling maintenance mode on remote server...${NC}"
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && sed -i 's/MAINTENANCE_MODE=false/MAINTENANCE_MODE=true/' .env.production && docker-compose restart web"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Maintenance mode enabled successfully!${NC}"
      echo -e "The site is now in maintenance mode. Only admins can access it."
    else
      echo -e "${RED}Failed to enable maintenance mode.${NC}"
      exit 1
    fi
    ;;
    
  off)
    echo -e "${YELLOW}Disabling maintenance mode on remote server...${NC}"
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && sed -i 's/MAINTENANCE_MODE=true/MAINTENANCE_MODE=false/' .env.production && docker-compose restart web"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Maintenance mode disabled successfully!${NC}"
      echo -e "The site is now accessible to all users."
    else
      echo -e "${RED}Failed to disable maintenance mode.${NC}"
      exit 1
    fi
    ;;
    
  *)
    usage
    ;;
esac

echo -e "${YELLOW}Note: It may take a few moments for the changes to take effect.${NC}"
exit 0 