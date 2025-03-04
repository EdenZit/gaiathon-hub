#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for GAIAthon-Hub..."

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p monitoring/prometheus

# Generate production environment if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "🔧 Generating production environment..."
    ./scripts/setup-production-env.sh
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin deployment-v3.1.0

# Build the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

# Start Docker Compose production stack
echo "🐳 Starting Docker Compose production stack..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for nginx to start
echo "⏳ Waiting for nginx to start..."
sleep 10

# Initialize SSL certificates
echo "🔒 Initializing SSL certificates..."
docker-compose -f docker-compose.prod.yml run --rm certbot

# Reload nginx to apply SSL certificates
echo "🔄 Reloading nginx configuration..."
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Start monitoring stack
echo "📊 Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should now be accessible at https://gaiathon.com"
echo "📊 Monitoring dashboard available at:"
echo "   - Prometheus: http://your-server-ip:9090"
echo "   - Grafana: http://your-server-ip:3001 (default admin password in .env.production)"

# Add SSL renewal cron job
echo "⚙️ Setting up SSL certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/docker-compose -f $(pwd)/docker-compose.prod.yml run --rm certbot renew && /usr/bin/docker-compose -f $(pwd)/docker-compose.prod.yml exec nginx nginx -s reload") | crontab -

echo "🎉 All done! Don't forget to:"
echo "1. Point your domain DNS to your server's IP address"
echo "2. Update the MongoDB Atlas IP whitelist if needed"
echo "3. Set up Grafana dashboards (default login: admin/admin)"
echo "4. Monitor the logs using: docker-compose -f docker-compose.prod.yml logs -f"
echo "5. Check monitoring metrics at http://your-server-ip:9090" 