#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
NGINX_CONF_DIR="nginx"
SSL_DIR="ssl"

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

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
}

check_env_vars() {
    log_info "Checking environment variables..."
    
    required_vars=(
        "MONGODB_URI"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
        "JWT_SECRET"
        "REDIS_URL"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
}

setup_ssl_directory() {
    log_info "Setting up SSL directory..."
    
    if [ ! -d "$SSL_DIR" ]; then
        mkdir -p "$SSL_DIR/certificates"
        mkdir -p "$SSL_DIR/private"
        log_info "Created SSL directory structure"
    fi
}

check_nginx_config() {
    log_info "Checking Nginx configuration..."
    
    if [ ! -d "$NGINX_CONF_DIR" ]; then
        log_error "Nginx configuration directory not found"
        exit 1
    fi
}

deploy_application() {
    log_info "Deploying application..."

    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose -f $DOCKER_COMPOSE_FILE pull

    # Build images
    log_info "Building Docker images..."
    docker-compose -f $DOCKER_COMPOSE_FILE build

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down

    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d

    # Check if containers are running
    if [ $? -eq 0 ]; then
        log_info "Application deployed successfully!"
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f

    # Remove unused volumes
    docker volume prune -f
}

# Main deployment process
main() {
    log_info "Starting deployment process..."

    # Run checks
    check_dependencies
    check_env_vars
    check_nginx_config
    setup_ssl_directory

    # Deploy
    deploy_application

    # Cleanup
    cleanup

    log_info "Deployment completed successfully!"
}

# Run main function
main 