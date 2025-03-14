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

echo -e "${YELLOW}Starting comprehensive maintenance mode fix...${NC}"

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

# Step 2: Check current maintenance mode setting
echo -e "${YELLOW}Checking current maintenance mode setting...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && grep MAINTENANCE_MODE .env.production"

# Step 3: Ensure maintenance mode is off in .env.production
echo -e "${YELLOW}Ensuring maintenance mode is off in .env.production...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && sed -i 's/MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' .env.production"

# Step 4: Check if there's a maintenance flag in the Nginx configuration
echo -e "${YELLOW}Checking Nginx configuration for maintenance redirects...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && if [ -d 'nginx' ]; then grep -r 'maintenance' nginx/; fi"

# Step 5: Create a temporary Nginx configuration that doesn't redirect to maintenance
echo -e "${YELLOW}Creating a temporary Nginx configuration without maintenance redirects...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && if [ -d 'nginx' ]; then 
  echo 'Creating backup of current Nginx config...'
  cp -r nginx nginx.bak
  
  echo 'Updating Nginx configuration...'
  if [ -f 'nginx/nginx.conf' ]; then
    # Remove or comment out any maintenance redirects
    sed -i 's|location / {.*return 307 /maintenance.*}|location / { proxy_pass http://localhost:3000; }|g' nginx/nginx.conf
    sed -i 's|rewrite ^/(.*)$ /maintenance redirect;|# rewrite ^/(.*)$ /maintenance redirect;|g' nginx/nginx.conf
  fi
fi"

# Step 6: Restart all containers
echo -e "${YELLOW}Restarting all containers...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"

# Step 7: Restart Nginx separately if it exists
echo -e "${YELLOW}Restarting Nginx container if it exists...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "docker ps | grep nginx && docker restart gaiathon-hub-nginx || echo 'No Nginx container found'"

echo -e "${GREEN}Maintenance mode fix completed!${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the changes to take effect.${NC}"
echo -e "${YELLOW}You may need to clear your browser cache to see the changes.${NC}"

echo -e "${GREEN}Your application should now be accessible at:${NC}"
echo -e "https://gaiathon.com"

# Step 8: Verify the site is accessible
echo -e "${YELLOW}Verifying site accessibility (this may take a moment)...${NC}"
sleep 10
curl -I https://gaiathon.com 