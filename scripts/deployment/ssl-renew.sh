#!/bin/bash

# Exit on error
set -e

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
SSL_DIR="ssl"
DOMAIN="your-domain.com"  # Replace with your domain
EMAIL="your-email@example.com"  # Replace with your email

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_certbot() {
    if ! command -v certbot &> /dev/null; then
        log_error "Certbot is not installed"
        log_info "Installing certbot..."
        apt-get update
        apt-get install -y certbot
    fi
}

renew_certificate() {
    log_info "Renewing SSL certificate for $DOMAIN..."

    # Stop nginx temporarily
    docker-compose -f $DOCKER_COMPOSE_FILE stop nginx

    # Renew certificate
    certbot renew --standalone \
        --preferred-challenges http \
        --http-01-port 80 \
        --deploy-hook "docker-compose -f $DOCKER_COMPOSE_FILE restart nginx"

    # Copy certificates to SSL directory
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/certificates/
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/private/

    # Set proper permissions
    chmod 644 $SSL_DIR/certificates/fullchain.pem
    chmod 600 $SSL_DIR/private/privkey.pem

    # Restart nginx
    docker-compose -f $DOCKER_COMPOSE_FILE start nginx

    log_info "SSL certificate renewed successfully!"
}

# Main renewal process
main() {
    log_info "Starting SSL certificate renewal process..."

    # Check dependencies
    check_certbot

    # Renew certificate
    renew_certificate

    log_info "SSL certificate renewal completed successfully!"
}

# Run main function
main 