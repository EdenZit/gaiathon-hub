#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

echo "Fixing all route files on the server..."

# Create a simple script to fix all route files on the remote server
cat > fix-all-routes-remote.sh << 'EOF'
#!/bin/bash

# Navigate to the application directory
cd /var/www/gaiathon-hub

# Fix all route.ts files
echo "Fixing all route.ts files..."
find src/app/api -name "route.ts" -type f -exec sed -i "s/export const middleware/export const config/g" {} \;
find src/app/api -name "route.ts" -type f -exec sed -i "/export.*middleware/d" {} \;

echo "All route files fixed successfully!"
EOF

# Make the script executable
chmod +x fix-all-routes-remote.sh

# Transfer the script to the server
scp -i ${SSH_KEY_PATH} fix-all-routes-remote.sh ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

# Execute the script on the server
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && chmod +x fix-all-routes-remote.sh && ./fix-all-routes-remote.sh"

# Clean up local script
rm fix-all-routes-remote.sh

echo "Route files fixed successfully!" 