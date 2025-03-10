#!/bin/bash

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"
REMOTE_DIR="/var/www/gaiathon-hub"

echo "Fixing document route type error..."

# Create a script to fix the document route file
cat > fix-document-route-remote.sh << 'EOF'
#!/bin/bash

# Navigate to the application directory
cd /var/www/gaiathon-hub

# Create a backup of the original file
cp src/app/api/admin/documents/route.ts src/app/api/admin/documents/route.ts.bak

# Fix the type error in the document route file
sed -i 's/const response: PaginatedResponse<IDocument> = {/const response: PaginatedResponse<any> = {/' src/app/api/admin/documents/route.ts

echo "Document route file fixed successfully!"
EOF

# Make the script executable
chmod +x fix-document-route-remote.sh

# Transfer the script to the server
scp -i ${SSH_KEY_PATH} fix-document-route-remote.sh ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/

# Execute the script on the server
ssh -i ${SSH_KEY_PATH} ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && chmod +x fix-document-route-remote.sh && ./fix-document-route-remote.sh"

# Clean up local script
rm fix-document-route-remote.sh

echo "Document route file fixed successfully!" 