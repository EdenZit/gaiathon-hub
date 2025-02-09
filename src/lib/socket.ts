import { Server as SocketIOServer, Socket } from 'socket.io';
import type { NextApiRequest } from 'next';
import { Server as NetServer } from 'http';
import { getSession } from 'next-auth/react';

interface CursorPosition {
  userId: string;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
}

interface ServerToClientEvents {
  teamUpdate: (data: TeamUpdateData) => void;
  cursorMove: (data: CursorPosition) => void;
  documentChange: (data: DocumentChangeData) => void;
  chatMessage: (data: ChatMessageData) => void;
}

interface ClientToServerEvents {
  'join-team': (teamId: string) => void;
  'leave-team': (teamId: string) => void;
  'cursor-move': (data: CursorPosition) => void;
  'document-change': (data: DocumentChangeData) => void;
  'send-message': (data: ChatMessageData) => void;
}

interface TeamUpdateData {
  teamId: string;
  type: 'member-join' | 'member-leave' | 'settings-update';
  payload: unknown;
}

interface DocumentChangeData {
  documentId: string;
  changes: unknown;
  version: number;
}

interface ChatMessageData {
  teamId: string;
  userId: string;
  message: string;
  timestamp: number;
}

interface SocketData {
  userId: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

type NextSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

type NextSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

export class SocketService {
  private static io: NextSocketServer | null = null;
  private static activeConnections: Map<string, Set<string>> = new Map();
  private static reconnectAttempts: Map<string, number> = new Map();
  private static readonly MAX_RECONNECT_ATTEMPTS = 5;

  public static getInstance(): NextSocketServer {
    if (!SocketService.io) {
      throw new Error('Socket.IO has not been initialized');
    }
    return SocketService.io;
  }

  private static async authenticateSocket(
    socket: NextSocket
  ): Promise<boolean> {
    try {
      const session = await getSession({ 
        req: socket.request as NextApiRequest 
      });
      if (!session?.user) {
        socket.disconnect(true);
        return false;
      }
      
      const userId = session.user.id;
      if (!SocketService.activeConnections.has(userId)) {
        SocketService.activeConnections.set(userId, new Set());
      }
      SocketService.activeConnections.get(userId)?.add(socket.id);
      
      socket.data.userId = userId;
      socket.data.user = session.user;
      
      return true;
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.disconnect(true);
      return false;
    }
  }

  public static initialize(server: NetServer) {
    if (SocketService.io) {
      console.warn('Socket.IO is already initialized');
      return;
    }

    SocketService.io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      never,
      SocketData
    >(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
        credentials: true
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      },
      pingTimeout: 20000,
      pingInterval: 25000,
    });

    SocketService.io.use(async (socket: NextSocket, next: (err?: Error) => void) => {
      try {
        const isAuthenticated = await SocketService.authenticateSocket(socket);
        if (isAuthenticated) {
          next();
        } else {
          next(new Error('Authentication failed'));
        }
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    SocketService.io.on('connection', (socket: NextSocket) => {
      console.log(`Client connected: ${socket.id} (User: ${socket.data.userId})`);

      // Reset reconnection attempts on successful connection
      SocketService.reconnectAttempts.delete(socket.data.userId);

      socket.on('join-team', async (teamId: string) => {
        try {
          socket.join(`team:${teamId}`);
          SocketService.io?.to(`team:${teamId}`).emit('teamUpdate', {
            teamId,
            type: 'member-join',
            payload: { userId: socket.data.userId }
          });
        } catch (error) {
          console.error(`Error joining team ${teamId}:`, error);
        }
      });

      socket.on('leave-team', (teamId: string) => {
        socket.leave(`team:${teamId}`);
        SocketService.io?.to(`team:${teamId}`).emit('teamUpdate', {
          teamId,
          type: 'member-leave',
          payload: { userId: socket.data.userId }
        });
      });

      socket.on('cursor-move', (data: CursorPosition) => {
        socket.broadcast.emit('cursorMove', data);
      });

      socket.on('document-change', (data: DocumentChangeData) => {
        socket.broadcast.emit('documentChange', data);
      });

      socket.on('send-message', (data: ChatMessageData) => {
        SocketService.io?.to(`team:${data.teamId}`).emit('chatMessage', data);
      });

      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId) {
          const attempts = (SocketService.reconnectAttempts.get(userId) || 0) + 1;
          SocketService.reconnectAttempts.set(userId, attempts);

          if (attempts > SocketService.MAX_RECONNECT_ATTEMPTS) {
            console.log(`Max reconnection attempts reached for user ${userId}`);
            SocketService.reconnectAttempts.delete(userId);
          }

          SocketService.activeConnections.get(userId)?.delete(socket.id);
          if (SocketService.activeConnections.get(userId)?.size === 0) {
            SocketService.activeConnections.delete(userId);
          }
        }
        console.log(`Client disconnected: ${socket.id} (User: ${userId})`);
      });
    });

    console.log('Socket.IO initialized with authentication');
  }

  public static isUserOnline(userId: string): boolean {
    return SocketService.activeConnections.has(userId);
  }

  public static getUserConnections(userId: string): Set<string> | undefined {
    return SocketService.activeConnections.get(userId);
  }

  public static getReconnectAttempts(userId: string): number {
    return SocketService.reconnectAttempts.get(userId) || 0;
  }
} 