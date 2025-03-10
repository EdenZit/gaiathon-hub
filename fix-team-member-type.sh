#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Fixing team member route file on server..."

# SSH to the server and fix the file
ssh -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_IP" "cd $REMOTE_DIR && \
  sed -i 's/team.members.some(member =>/team.members.some((member: any) =>/' src/app/api/admin/teams/\[id\]/members/\[memberId\]/route.ts && \
  echo -e '${GREEN}Team member route file fixed successfully!${NC}' && \
  grep -n 'team.members.some' src/app/api/admin/teams/\[id\]/members/\[memberId\]/route.ts"

echo "Team member route file fixed successfully!" 