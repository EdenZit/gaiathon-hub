#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
REMOTE_DIR="/var/www/gaiathon-hub"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"

echo -e "${YELLOW}Starting Nginx fix process...${NC}"

# Step 1: Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
echo -e "You will be prompted for your SSH key passphrase..."
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "echo SSH connection successful"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}SSH connection successful!${NC}"
else
    echo -e "${RED}SSH connection failed. Please check your SSH key and server configuration.${NC}"
    exit 1
fi

# Step 2: Ensure maintenance mode is off
echo -e "${YELLOW}Ensuring maintenance mode is off...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' .env.production"

# Step 3: Restart all containers with --remove-orphans
echo -e "${YELLOW}Restarting all containers and removing orphans...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --remove-orphans"

echo -e "${GREEN}Nginx fix process completed!${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the changes to take effect.${NC}"
echo -e "${YELLOW}You may need to clear your browser cache to see the changes.${NC}"

echo -e "${GREEN}Your application should now be accessible at:${NC}"
echo -e "https://gaiathon.com" 