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
NEW_FAVICON_PATH="./public/images/gaia_fav.png"

echo -e "${GREEN}Updating favicon with ${NEW_FAVICON_PATH}...${NC}"

# Check if the new favicon image exists
if [ ! -f "${NEW_FAVICON_PATH}" ]; then
    echo -e "${RED}Error: New favicon image not found at ${NEW_FAVICON_PATH}${NC}"
    exit 1
fi

# Transfer the new favicon image to the server
echo -e "${YELLOW}Transferring new favicon image to server...${NC}"
scp -i "${SSH_KEY_PATH}" "${NEW_FAVICON_PATH}" "${SERVER_USER}@${SERVER_IP}:/var/www/gaiathon-hub/public/images/gaia_fav.png"

# Create a script to run on the server
cat > update-favicon-remote.sh << EOL
#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    apt-get update
    apt-get install -y imagemagick
fi

# Create directory for favicon files if it doesn't exist
mkdir -p /var/www/gaiathon-hub/public/favicon

# Convert the new favicon image to various sizes
echo "Converting new favicon to various formats..."
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 16x16 /var/www/gaiathon-hub/public/favicon/favicon-16x16.png
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 32x32 /var/www/gaiathon-hub/public/favicon/favicon-32x32.png
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 48x48 /var/www/gaiathon-hub/public/favicon/favicon-48x48.png
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 180x180 /var/www/gaiathon-hub/public/favicon/apple-touch-icon.png
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 192x192 /var/www/gaiathon-hub/public/favicon/android-chrome-192x192.png
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 512x512 /var/www/gaiathon-hub/public/favicon/android-chrome-512x512.png

# Create favicon.ico (multi-size icon)
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 16x16 /var/www/gaiathon-hub/public/favicon/favicon-16x16.ico
convert /var/www/gaiathon-hub/public/images/gaia_fav.png -resize 32x32 /var/www/gaiathon-hub/public/favicon/favicon-32x32.ico
convert /var/www/gaiathon-hub/public/favicon/favicon-16x16.ico /var/www/gaiathon-hub/public/favicon/favicon-32x32.ico /var/www/gaiathon-hub/public/favicon.ico

# Also create a root favicon.ico for browsers that look for it there
cp /var/www/gaiathon-hub/public/favicon.ico /var/www/gaiathon-hub/public/

echo "New favicon files created successfully!"
EOL

# Make the remote script executable
chmod +x update-favicon-remote.sh

echo -e "${YELLOW}Transferring update script to server...${NC}"

# Transfer the script to the server
scp -i "${SSH_KEY_PATH}" update-favicon-remote.sh "${SERVER_USER}@${SERVER_IP}:/root/update-favicon-remote.sh"

# Execute the script on the server
echo -e "${YELLOW}Executing update script on server...${NC}"
ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "chmod +x /root/update-favicon-remote.sh && /root/update-favicon-remote.sh"

# Clean up local files
rm update-favicon-remote.sh

echo -e "${GREEN}Favicon update complete!${NC}"
echo -e "${YELLOW}You may need to rebuild the application or restart the server for changes to take effect.${NC}"

# Ask if the user wants to restart the application
read -p "Do you want to restart the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restarting the application...${NC}"
    ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "cd /var/www/gaiathon-hub && docker-compose -f docker-compose.prod.yml restart web"
    echo -e "${GREEN}Application restarted!${NC}"
    echo -e "${YELLOW}Note: You may need to clear your browser cache to see the new favicon.${NC}"
fi

echo -e "${GREEN}Update complete!${NC}" 