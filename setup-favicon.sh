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
LOGO_PATH="./public/images/logo.png"

echo -e "${GREEN}Setting up favicon from ${LOGO_PATH}...${NC}"

# Check if the logo file exists
if [ ! -f "${LOGO_PATH}" ]; then
    echo -e "${RED}Error: Logo file not found at ${LOGO_PATH}${NC}"
    exit 1
fi

# Create a script to run on the server
cat > setup-favicon-remote.sh << EOL
#!/bin/bash

# Install required packages if not already installed
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    apt-get update
    apt-get install -y imagemagick
fi

# Create directory for favicon files
mkdir -p /var/www/gaiathon-hub/public/favicon

# Convert the logo to various favicon sizes
echo "Converting logo to favicon formats..."
convert /var/www/gaiathon-hub/public/images/logo.png -resize 16x16 /var/www/gaiathon-hub/public/favicon/favicon-16x16.png
convert /var/www/gaiathon-hub/public/images/logo.png -resize 32x32 /var/www/gaiathon-hub/public/favicon/favicon-32x32.png
convert /var/www/gaiathon-hub/public/images/logo.png -resize 48x48 /var/www/gaiathon-hub/public/favicon/favicon-48x48.png
convert /var/www/gaiathon-hub/public/images/logo.png -resize 180x180 /var/www/gaiathon-hub/public/favicon/apple-touch-icon.png
convert /var/www/gaiathon-hub/public/images/logo.png -resize 192x192 /var/www/gaiathon-hub/public/favicon/android-chrome-192x192.png
convert /var/www/gaiathon-hub/public/images/logo.png -resize 512x512 /var/www/gaiathon-hub/public/favicon/android-chrome-512x512.png

# Create favicon.ico (multi-size icon)
convert /var/www/gaiathon-hub/public/images/logo.png -resize 16x16 /var/www/gaiathon-hub/public/favicon/favicon-16x16.ico
convert /var/www/gaiathon-hub/public/images/logo.png -resize 32x32 /var/www/gaiathon-hub/public/favicon/favicon-32x32.ico
convert /var/www/gaiathon-hub/public/favicon/favicon-16x16.ico /var/www/gaiathon-hub/public/favicon/favicon-32x32.ico /var/www/gaiathon-hub/public/favicon.ico

# Create a site.webmanifest file
cat > /var/www/gaiathon-hub/public/site.webmanifest << MANIFEST
{
    "name": "GAIAthon Hub",
    "short_name": "GAIAthon",
    "icons": [
        {
            "src": "/favicon/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/favicon/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone"
}
MANIFEST

# Update the layout component to include favicon links
echo "Updating layout component with favicon links..."

# Find the layout file
LAYOUT_FILE=\$(find /var/www/gaiathon-hub/src -name "layout.tsx" | grep -v node_modules | head -n 1)

if [ -z "\$LAYOUT_FILE" ]; then
    echo "Layout file not found. Trying to find RootLayout..."
    LAYOUT_FILE=\$(find /var/www/gaiathon-hub/src -name "*.tsx" -exec grep -l "RootLayout" {} \; | grep -v node_modules | head -n 1)
fi

if [ -n "\$LAYOUT_FILE" ]; then
    echo "Found layout file at \$LAYOUT_FILE"
    
    # Check if the file already has favicon links
    if grep -q "favicon" "\$LAYOUT_FILE"; then
        echo "Favicon links already exist in the layout file."
    else
        # Find the closing head tag and insert favicon links before it
        sed -i '/<\/head>/i \\        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />\n        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />\n        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />\n        <link rel="manifest" href="/site.webmanifest" />\n        <link rel="shortcut icon" href="/favicon.ico" />' "\$LAYOUT_FILE"
        echo "Added favicon links to \$LAYOUT_FILE"
    fi
else
    echo "Layout file not found. Creating a custom favicon component..."
    
    # Create a favicon component
    mkdir -p /var/www/gaiathon-hub/src/components/common
    cat > /var/www/gaiathon-hub/src/components/common/Favicon.tsx << FAVICON
import React from 'react';

export const Favicon = () => (
  <>
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="shortcut icon" href="/favicon.ico" />
  </>
);

export default Favicon;
FAVICON
    
    echo "Created Favicon component at /var/www/gaiathon-hub/src/components/common/Favicon.tsx"
    echo "You'll need to import and use this component in your layout file."
fi

echo "Favicon setup complete!"
EOL

# Make the remote script executable
chmod +x setup-favicon-remote.sh

echo -e "${YELLOW}Transferring setup script to server...${NC}"

# Transfer the script to the server
scp -i "${SSH_KEY_PATH}" setup-favicon-remote.sh "${SERVER_USER}@${SERVER_IP}:/root/setup-favicon-remote.sh"

# Execute the script on the server
echo -e "${YELLOW}Executing setup script on server...${NC}"
ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "chmod +x /root/setup-favicon-remote.sh && /root/setup-favicon-remote.sh"

# Clean up local files
rm setup-favicon-remote.sh

echo -e "${GREEN}Favicon setup complete!${NC}"
echo -e "${YELLOW}You may need to rebuild the application for changes to take effect.${NC}"

# Ask if the user wants to rebuild the application
read -p "Do you want to rebuild the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Rebuilding the application...${NC}"
    ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "cd /var/www/gaiathon-hub && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build"
    echo -e "${GREEN}Application rebuilt and restarted!${NC}"
fi

echo -e "${GREEN}Setup complete!${NC}" 