#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="~/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Upcloud server...${NC}"

# Step 1: Check if SSH connection works
echo -e "${YELLOW}Testing SSH connection...${NC}"
echo -e "${YELLOW}You will be prompted for your SSH key passphrase...${NC}"
ssh -i ${SSH_KEY_PATH} -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} echo "SSH connection successful"
if [ $? -ne 0 ]; then
  echo -e "${RED}SSH connection failed. Please check your SSH key and server configuration.${NC}"
  exit 1
fi
echo -e "${GREEN}SSH connection successful!${NC}"

# Step 2: Clean up Docker resources on the server
echo -e "${YELLOW}Cleaning up Docker resources on the server...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && \
docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true && \
docker system prune -f && \
docker volume prune -f"
echo -e "${GREEN}Docker resources cleaned up!${NC}"

# Step 3: Create remote directory if it doesn't exist
echo -e "${YELLOW}Creating remote directory if it doesn't exist...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_DIR}"
echo -e "${GREEN}Remote directory ready!${NC}"

# Step 4: Transfer essential files
echo -e "${YELLOW}Transferring essential files...${NC}"
scp -i ${SSH_KEY_PATH} docker-compose.prod.yml ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/
scp -i ${SSH_KEY_PATH} Dockerfile.prod ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/
scp -i ${SSH_KEY_PATH} nginx-proxy.conf ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/
scp -i ${SSH_KEY_PATH} -r nginx ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

# Step 5: Transfer application code
echo -e "${YELLOW}Transferring application code...${NC}"
# Option 1: Transfer the entire application (slower but ensures everything is transferred)
rsync -avz -e "ssh -i ${SSH_KEY_PATH}" --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

echo -e "${GREEN}Files transferred successfully!${NC}"

# Step 6: Set up Nginx proxy on the server
echo -e "${YELLOW}Setting up Nginx proxy on the server...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cp ${REMOTE_DIR}/nginx-proxy.conf /etc/nginx/sites-available/gaiathon-hub && \
ln -sf /etc/nginx/sites-available/gaiathon-hub /etc/nginx/sites-enabled/ && \
nginx -t && \
systemctl reload nginx"

# Step 7: Set up and start the application on the server
echo -e "${YELLOW}Setting up and starting the application on the server...${NC}"
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && \
export \$(grep -v '^#' .env.production | xargs) && \
docker-compose -f docker-compose.prod.yml build --no-cache && \
docker-compose -f docker-compose.prod.yml up -d"

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Your application should now be accessible at:${NC}"
echo -e "${GREEN}http://${SERVER_IP}${NC}" 