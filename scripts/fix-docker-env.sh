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

echo -e "${YELLOW}Starting Docker environment fix...${NC}"

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

# Step 2: Create a backup of the docker-compose.prod.yml file
echo -e "${YELLOW}Creating a backup of the docker-compose.prod.yml file...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && cp docker-compose.prod.yml docker-compose.prod.yml.bak"

# Step 3: Update the docker-compose.prod.yml file to include the MAINTENANCE_MODE environment variable
echo -e "${YELLOW}Updating the docker-compose.prod.yml file...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && sed -i '/NEXTAUTH_SECRET/a\      - MAINTENANCE_MODE=\${MAINTENANCE_MODE:-false}' docker-compose.prod.yml"

# Step 4: Ensure MAINTENANCE_MODE is set to false in .env.production
echo -e "${YELLOW}Ensuring MAINTENANCE_MODE is set to false in .env.production...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' .env.production"

# Step 5: Restart the containers
echo -e "${YELLOW}Restarting the containers...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"

# Step 6: Verify the environment variables in the container
echo -e "${YELLOW}Verifying the environment variables in the container...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "docker exec gaiathon-hub-web env | grep MAINTENANCE"

# Step 7: Check if the site is accessible
echo -e "${YELLOW}Checking if the site is accessible (this may take a moment)...${NC}"
sleep 10
curl -I https://gaiathon.com

echo -e "${GREEN}Docker environment fix completed!${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the changes to take effect.${NC}"
echo -e "${YELLOW}You may need to clear your browser cache to see the changes.${NC}"

echo -e "${GREEN}Your application should now be accessible at:${NC}"
echo -e "https://gaiathon.com" 