import Redis from 'ioredis';
import { EventEmitter } from 'events';

interface CursorPosition {
  userId: string;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
}

interface DocumentState {
  content: string;
  version: number;
  lastModified: number;
  modifiedBy: string;
}

const CHANNELS = {
  DOCUMENT_CHANGES: 'DOCUMENT_CHANGES',
  CURSOR_POSITIONS: 'CURSOR_POSITIONS',
  TEAM_CHAT: 'TEAM_CHAT',
  TEAM_UPDATES: 'TEAM_UPDATES',
} as const;

class RedisService extends EventEmitter {
  private static instance: RedisService;
  private publisher: Redis;
  private subscriber: Redis;
  private client: Redis;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    
    // Skip Redis connection during build process
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping Redis connection during build phase');
      this.publisher = this.createMockRedisClient();
      this.subscriber = this.createMockRedisClient();
      this.client = this.createMockRedisClient();
      return;
    }
    
    // Use REDIS_URL from environment variables
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    console.log(`Connecting to Redis at: ${redisUrl}`);
    
    const redisOptions = {
      // Use URL instead of host/port
      url: redisUrl,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      autoResendUnfulfilledCommands: true,
      lazyConnect: true,
    };

    try {
      this.publisher = new Redis(redisOptions);
      this.subscriber = new Redis(redisOptions);
      this.client = new Redis(redisOptions);
      this.setupEventHandlers();
      this.startHealthCheck();
    } catch (error) {
      console.error('Failed to initialize Redis connections:', error);
      // Fallback to mock clients
      this.publisher = this.createMockRedisClient();
      this.subscriber = this.createMockRedisClient();
      this.client = this.createMockRedisClient();
    }
  }

  private createMockRedisClient() {
    // Create a mock Redis client for build process
    const mockClient = {
      on: () => mockClient,
      connect: async () => {},
      disconnect: async () => {},
      quit: async () => {},
      ping: async () => 'PONG',
      publish: async () => 0,
      subscribe: async () => {},
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
    } as unknown as Redis;
    return mockClient;
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventHandlers() {
    const connections = [
      { name: 'publisher', client: this.publisher },
      { name: 'subscriber', client: this.subscriber },
      { name: 'client', client: this.client },
    ];

    connections.forEach(({ name, client }) => {
      client.on('connect', () => {
        console.log(`Redis ${name} connected`);
        this.emit('connect', name);
      });

      client.on('error', (error) => {
        console.error(`Redis ${name} error:`, error);
        this.emit('error', { name, error });
      });

      client.on('close', () => {
        console.warn(`Redis ${name} connection closed`);
        this.emit('close', name);
      });

      client.on('reconnecting', () => {
        console.log(`Redis ${name} reconnecting...`);
        this.emit('reconnecting', name);
      });
    });
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.client.ping();
        this.emit('health', { status: 'healthy' });
      } catch (error) {
        console.error('Redis health check failed:', error);
        this.emit('health', { status: 'unhealthy', error });
      }
    }, 30000); // Check every 30 seconds
  }

  public async publish(channel: keyof typeof CHANNELS, message: any) {
    try {
      await this.publisher.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error(`Error publishing to ${channel}:`, error);
      throw error;
    }
  }

  public async subscribe(channel: keyof typeof CHANNELS, callback: (message: any) => void) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          callback(JSON.parse(message));
        }
      });
    } catch (error) {
      console.error(`Error subscribing to ${channel}:`, error);
      throw error;
    }
  }

  public async saveDocumentState(docId: string, state: DocumentState) {
    try {
      await this.client.set(`doc:${docId}:state`, JSON.stringify(state));
      await this.client.set(`doc:${docId}:version`, state.version.toString());
    } catch (error) {
      console.error(`Error saving document state for ${docId}:`, error);
      throw error;
    }
  }

  public async getDocumentState(docId: string): Promise<DocumentState | null> {
    try {
      const state = await this.client.get(`doc:${docId}:state`);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error(`Error getting document state for ${docId}:`, error);
      throw error;
    }
  }

  public async updateCursorPosition(userId: string, docId: string, position: CursorPosition) {
    try {
      await this.client.set(
        `cursor:${docId}:${userId}`,
        JSON.stringify(position),
        'EX',
        30 // Expire after 30 seconds
      );
    } catch (error) {
      console.error(`Error updating cursor position for ${userId}:`, error);
      throw error;
    }
  }

  public async getCursorPositions(docId: string): Promise<CursorPosition[]> {
    try {
      const cursors = await this.client.keys(`cursor:${docId}:*`);
      const positions = await Promise.all(
        cursors.map(async (key) => {
          const position = await this.client.get(key);
          return position ? JSON.parse(position) : null;
        })
      );
      return positions.filter((pos): pos is CursorPosition => pos !== null);
    } catch (error) {
      console.error(`Error getting cursor positions for ${docId}:`, error);
      throw error;
    }
  }

  public async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
      this.client.quit(),
    ]);
  }

  public async ping(): Promise<string> {
    return this.client.ping();
  }

  public getClient(): Redis {
    return this.client;
  }
}

// Export singleton instance
export const redis = RedisService.getInstance();

// Export Redis client type
export type RedisClient = Redis; 