# GAIAthon-Hub

A unified platform for Earth Observation resources, collaboration, and innovation. Access tools from SNAP, WEkEO, Dunia, and more in one place.

## Features

- Centralized access to Earth Observation tools and datasets
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
