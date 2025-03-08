# GAIAthon-Hub

A unified platform for Earth Observation resources, collaboration, and innovation. Access tools from WEkEO, Dunia, and more in one place.

## Features

- EO Tools access to Earth Observation tools and datasets
- AI-powered assistance for Earth Observation projects
- Real-time team collaboration workspace
- User authentication and authorization
- Modern, responsive UI built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: NextAuth.js
- **Containerization**: Docker
- **Styling**: Tailwind CSS

## Security Best Practices

### Environment Variables
1. Never commit `.env` files to version control
2. Use `.env.example` as a template
3. Generate secure secrets using `npm run generate-secrets`
4. Use different secrets for each environment
5. Rotate secrets periodically

### MongoDB Atlas
1. Use strong, unique passwords
2. Enable IP whitelist
3. Use the minimum required permissions
4. Enable database auditing
5. Regular security audits

### Redis Security
1. Run Redis in Docker with persistence
2. Enable protected mode
3. Use strong Redis passwords
4. Regular security updates

### API Security
1. Rate limiting enabled
2. CSRF protection
3. Secure session management
4. Input validation
5. Error handling

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- MongoDB Atlas account (or local MongoDB)
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gaiathon-hub.git
   cd gaiathon-hub
   ```

2. Create a `.env` file in the root directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

3. Start the development environment:
   ```bash
   docker-compose up --build
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

The project uses Docker for development. The development environment includes:
- Hot reloading
- TypeScript compilation
- Tailwind CSS processing
- MongoDB and Redis services

## Docker Deployment

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## Testing

```bash
# Run tests
npm run test

# Check database connection
npm run check:db

# Clean database
npm run db:clean
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Image Management

The GAIAthon-Hub platform uses a dedicated approach for handling images to ensure optimal performance and maintainability:

### Image Storage

- Images are stored in the `/public/images/` directory, organized by category (blog, gallery, partners, etc.)
- For Docker deployments, images are stored in a dedicated volume (`app_images`) to keep the Docker image size small
- The `.dockerignore` file excludes the `/public/images/` directory from the build context

### Image Management Tools

The project includes a dedicated script for managing images:

```bash
# Backup all images
./scripts/manage-images.sh backup

# Restore images from a backup
./scripts/manage-images.sh restore [backup_filename]

# Sync images to production
./scripts/manage-images.sh sync-to-prod [production_server]

# Sync images from production
./scripts/manage-images.sh sync-from-prod [production_server]
```

### Image Optimization

- The project uses Next.js Image component for automatic image optimization
- A custom `OptimizedImage` component is available at `app/components/ui/OptimizedImage.tsx`
- Images are automatically optimized for different device sizes and formats

### Best Practices

1. Keep image files as small as possible (use WebP format when possible)
2. Use appropriate image dimensions for each use case
3. Use the `OptimizedImage` component for all images to ensure proper optimization
4. Regularly backup images using the provided script
5. Consider using a CDN for production deployments with high traffic
