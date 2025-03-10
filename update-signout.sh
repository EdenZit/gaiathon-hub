#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="5.22.218.179"
SERVER_USER="root"
SSH_KEY_PATH="/Users/g-wiafe/.ssh/gaiathon_upcloud"

echo -e "${GREEN}Updating sign-out functionality...${NC}"

# Create a script to run on the server
cat > update-signout-remote.sh << EOL
#!/bin/bash

# Update the DashboardHeader component
echo "Updating DashboardHeader component..."
sed -i 's/onClick={() => signOut()}/onClick={() => signOut({ callbackUrl: '\''\/'\'' })}/g' /var/www/gaiathon-hub/src/components/dashboard/DashboardHeader.tsx

# Update the AdminHeader component
echo "Updating AdminHeader component..."
sed -i 's/onClick={() => signOut()}/onClick={() => signOut({ callbackUrl: '\''\/'\'' })}/g' /var/www/gaiathon-hub/src/components/admin/AdminHeader.tsx

# Update the SignOutButton component
echo "Updating SignOutButton component..."
sed -i 's/await signOut({ redirect: false })/await signOut({ callbackUrl: '\''\/'\'' })/g' /var/www/gaiathon-hub/src/components/auth/SignOutButton.tsx

# Update the environment variables
echo "Updating environment variables..."
sed -i 's/NEXTAUTH_URL=http:\/\/localhost:3000/NEXTAUTH_URL=https:\/\/gaiathon.com/g' /var/www/gaiathon-hub/.env

echo "Sign-out functionality updated successfully!"
EOL

# Make the remote script executable
chmod +x update-signout-remote.sh

echo -e "${YELLOW}Transferring update script to server...${NC}"

# Transfer the script to the server
scp -i "${SSH_KEY_PATH}" update-signout-remote.sh "${SERVER_USER}@${SERVER_IP}:/root/update-signout-remote.sh"

# Execute the script on the server
echo -e "${YELLOW}Executing update script on server...${NC}"
ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "chmod +x /root/update-signout-remote.sh && /root/update-signout-remote.sh"

# Clean up local files
rm update-signout-remote.sh

echo -e "${GREEN}Sign-out functionality update complete!${NC}"
echo -e "${YELLOW}You need to rebuild the application for changes to take effect.${NC}"

# Ask if the user wants to rebuild the application
read -p "Do you want to rebuild the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rebuilding the application...${NC}"
    ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "cd /var/www/gaiathon-hub && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build"
    echo -e "${GREEN}Application rebuilt and restarted!${NC}"
fi

echo -e "${GREEN}Update complete!${NC}" 