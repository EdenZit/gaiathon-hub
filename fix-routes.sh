#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing route files on the server...${NC}"

# Create a script to fix route files on the remote server
cat > fix-routes-remote.sh << 'EOF'
#!/bin/bash

# Navigate to the application directory
cd /var/www/gaiathon-hub

# Find all route.ts files and replace middleware with config
find src/app/api -name "route.ts" -type f -exec sed -i "s/export const middleware/export const config/g" {} \;

# List of specific files to check for middleware exports
FILES_TO_CHECK=(
  "src/app/api/admin/teams/route.ts"
  "src/app/api/admin/teams/[id]/route.ts"
  "src/app/api/admin/teams/[id]/status/route.ts"
  "src/app/api/admin/teams/[id]/members/route.ts"
  "src/app/api/admin/teams/[id]/members/[memberId]/route.ts"
  "src/app/api/admin/teams/export/route.ts"
  "src/app/api/admin/users/[userId]/role/route.ts"
  "src/app/api/admin/users/[userId]/status/route.ts"
  "src/app/api/admin/users/[userId]/team-role/route.ts"
  "src/app/api/admin/users/export/route.ts"
)

# Remove any middleware exports from these files
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing file: $file"
    sed -i "/export.*middleware/d" "$file"
  fi
done

echo "All route files fixed successfully!"
EOF

# Make the script executable
chmod +x fix-routes-remote.sh

# Transfer the script to the server
scp -i ${SSH_KEY_PATH} fix-routes-remote.sh ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

# Execute the script on the server
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && chmod +x fix-routes-remote.sh && ./fix-routes-remote.sh"

# Clean up local script
rm fix-routes-remote.sh

echo -e "${GREEN}Route files fixed successfully!${NC}" 