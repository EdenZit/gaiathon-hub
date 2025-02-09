import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { SocketService } from './socket';
import { redis } from './redis';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function gracefulShutdown(server: ReturnType<typeof createServer>) {
  console.log('Starting graceful shutdown...');
  
  try {
    // Close HTTP server first to stop accepting new connections
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error('Error closing HTTP server:', err);
          reject(err);
        } else {
          console.log('HTTP server closed');
          resolve(true);
        }
      });
    });

    // Cleanup Redis connections
    await redis.cleanup();
    console.log('Redis connections closed');

  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }
}

export async function startServer() {
  try {
    await app.prepare();
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Initialize Socket.IO with error handling
    try {
      SocketService.initialize(server);
      console.log('Socket.IO initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
      // Continue running the server even if Socket.IO fails
    }

    // Handle graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`${signal} received...`);
        await gracefulShutdown(server);
        process.exit(0);
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await gracefulShutdown(server);
      process.exit(1);
    });

    process.on('unhandledRejection', async (error) => {
      console.error('Unhandled rejection:', error);
      await gracefulShutdown(server);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : 'production'
        }`
      );
    });

    return server;
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
} 