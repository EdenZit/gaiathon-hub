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
DOMAIN="www.gaiathon.com"
DOMAIN_ROOT="gaiathon.com"

echo -e "${GREEN}Setting up domain ${DOMAIN} for your application...${NC}"

# Create rate limit configuration
cat > rate-limit.conf << EOL
# Rate limiting configuration
limit_req_zone \$binary_remote_addr zone=one:10m rate=1r/s;
limit_req_zone \$binary_remote_addr zone=two:10m rate=10r/s;
EOL

# Create Nginx configuration for the domain
cat > nginx-domain.conf << EOL
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${DOMAIN_ROOT};

    location / {
        return 301 https://\$host\$request_uri;
    }

    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} ${DOMAIN_ROOT};

    ssl_certificate /etc/nginx/ssl/certificates/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/private/privkey.pem;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Proxy to the Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Rate limiting for API endpoints
    location ~ ^/api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        limit_req zone=one burst=5 nodelay;
    }

    location ~ ^/api/auth/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        limit_req zone=one burst=3 nodelay;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOL

echo -e "${YELLOW}Transferring Nginx configuration to server...${NC}"

# Transfer the configuration files to the server
scp -i "${SSH_KEY_PATH}" nginx-domain.conf "${SERVER_USER}@${SERVER_IP}:/etc/nginx/conf.d/gaiathon.conf"
scp -i "${SSH_KEY_PATH}" rate-limit.conf "${SERVER_USER}@${SERVER_IP}:/etc/nginx/conf.d/rate-limit.conf"

# Create a script to run on the server
cat > setup-domain-remote.sh << EOL
#!/bin/bash

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Create directory for Let's Encrypt verification
mkdir -p /var/www/html/.well-known/acme-challenge

# Test Nginx configuration
nginx -t

if [ \$? -eq 0 ]; then
    echo "Nginx configuration is valid. Reloading Nginx..."
    systemctl reload nginx
    
    # Obtain SSL certificate using certbot
    echo "Obtaining SSL certificate for ${DOMAIN} and ${DOMAIN_ROOT}..."
    certbot --nginx -d ${DOMAIN} -d ${DOMAIN_ROOT} --non-interactive --agree-tos --email admin@${DOMAIN_ROOT} || echo "Certbot failed, but continuing with setup. You can run certbot manually later."
    
    # Reload Nginx again after certbot changes
    systemctl reload nginx
    
    echo "Domain setup complete!"
else
    echo "Nginx configuration is invalid. Please check the configuration."
    exit 1
fi
EOL

# Make the remote script executable
chmod +x setup-domain-remote.sh

echo -e "${YELLOW}Transferring setup script to server...${NC}"

# Transfer the script to the server
scp -i "${SSH_KEY_PATH}" setup-domain-remote.sh "${SERVER_USER}@${SERVER_IP}:/root/setup-domain-remote.sh"

# Execute the script on the server
echo -e "${YELLOW}Executing setup script on server...${NC}"
ssh -i "${SSH_KEY_PATH}" "${SERVER_USER}@${SERVER_IP}" "chmod +x /root/setup-domain-remote.sh && /root/setup-domain-remote.sh"

echo -e "${GREEN}Domain setup process completed!${NC}"
echo -e "${YELLOW}IMPORTANT: Make sure to update your DNS records to point ${DOMAIN} and ${DOMAIN_ROOT} to ${SERVER_IP}${NC}"
echo -e "${YELLOW}DNS A records should be created for:${NC}"
echo -e "${YELLOW}1. ${DOMAIN_ROOT} -> ${SERVER_IP}${NC}"
echo -e "${YELLOW}2. ${DOMAIN} -> ${SERVER_IP}${NC}"
echo -e "${YELLOW}DNS changes may take up to 24-48 hours to propagate globally.${NC}"

# Clean up local files
rm nginx-domain.conf setup-domain-remote.sh rate-limit.conf

echo -e "${GREEN}Setup complete!${NC}" 