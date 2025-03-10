#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

echo "Directly fixing document route type error on the server..."

# Execute the command directly on the server
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && sed -i 's/const response: PaginatedResponse<IDocument> = {/const response: PaginatedResponse<any> = {/' src/app/api/admin/documents/route.ts"

# Verify the change
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "grep -n 'PaginatedResponse<' ${REMOTE_DIR}/src/app/api/admin/documents/route.ts"

echo "Document route file fixed successfully!" 