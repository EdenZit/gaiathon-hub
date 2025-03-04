#!/bin/bash

# Exit on error
set -e

# Function to generate a random string
generate_secret() {
    openssl rand -base64 32
}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Setting up production environment variables...${NC}"

# Create production env file
ENV_FILE=".env.production"

# Check if file exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}⚠️  Production environment file already exists. Creating backup...${NC}"
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Generate new env file
cat > "$ENV_FILE" << EOL
# GAIAthon Hub Production Environment Configuration
# Generated on $(date)

# Application Configuration
NODE_ENV=production
APP_NAME=GAIAthon Hub
APP_URL=https://gaiathon.com

# Authentication Configuration
NEXTAUTH_URL=https://gaiathon.com
NEXTAUTH_SECRET=$(generate_secret)

# Database Configuration
MONGODB_URI=${MONGODB_URI:-"mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"}

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security Configuration
JWT_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)
CSRF_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_secret)
COOKIE_SECRET=$(generate_secret)

# Rate Limiting
RATE_LIMIT_REQUESTS=30
RATE_LIMIT_WINDOW_MS=60000

# Admin Configuration
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@gaiathon.com"}
ADMIN_PASSWORD=$(generate_secret)

# Session Configuration
SESSION_MAX_AGE=3600
JWT_MAX_AGE=3600

# Security Features
ENABLE_RATE_LIMITING=true
ENABLE_CSRF_PROTECTION=true

# AWS SES Configuration
AWS_SES_ACCESS_KEY_ID=${AWS_SES_ACCESS_KEY_ID:-"your_access_key"}
AWS_SES_SECRET_ACCESS_KEY=${AWS_SES_SECRET_ACCESS_KEY:-"your_secret_key"}
AWS_SES_REGION=${AWS_SES_REGION:-"us-east-1"}

# Telemetry
NEXT_TELEMETRY_DISABLED=1

# Production Specific
PRODUCTION_DEPLOY=true
ENABLE_ERROR_REPORTING=true
EOL

echo -e "${GREEN}✅ Production environment file created at $ENV_FILE${NC}"
echo -e "${BLUE}⚠️  IMPORTANT: Please update the following values manually:${NC}"
echo "1. MONGODB_URI with your MongoDB Atlas connection string"
echo "2. ADMIN_EMAIL with your admin email"
echo "3. AWS SES credentials if using email functionality"
echo -e "${BLUE}⚠️  Save these credentials securely and never commit them to version control!${NC}"

# Create a secure copy for Docker deployment
echo -e "${BLUE}📝 Creating secure copy for Docker deployment...${NC}"
cp "$ENV_FILE" ".env.production.docker"

echo -e "${GREEN}🎉 All done! Your production environment is ready to be configured.${NC}" 