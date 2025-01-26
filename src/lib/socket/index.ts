import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { parse } from 'cookie';
import { getToken } from 'next-auth/jwt';
import type { TeamRole } from '@/types/team';

interface TeamSocketData {
  teamId?: string;
  userId?: string;
  role?: TeamRole;
}

type TeamSocket = Socket & TeamSocketData;

export const initializeSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cookie: true,
  });

  // Authentication middleware
  io.use(async (socket: TeamSocket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) {
        return next(new Error('Authentication failed'));
      }

      const token = await getToken({
        req: {
          headers: {
            cookie,
          },
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return next(new Error('Authentication failed'));
      }

      socket.userId = token.sub as string;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Team room middleware
  io.use((socket: TeamSocket, next) => {
    const { teamId } = socket.handshake.query;
    if (!teamId) {
      return next(new Error('Team ID required'));
    }
    socket.teamId = teamId as string;
    next();
  });

  // Handle connections
  io.on('connection', (socket: TeamSocket) => {
    console.log(`User ${socket.userId} connected to team ${socket.teamId}`);

    // Join team room
    socket.join(socket.teamId!);

    // Handle chat messages
    socket.on('team:message', (message) => {
      io.to(socket.teamId!).emit('team:message', {
        userId: socket.userId,
        message,
        timestamp: new Date(),
      });
    });

    // Handle document collaboration
    socket.on('document:update', (data) => {
      socket.to(socket.teamId!).emit('document:update', {
        userId: socket.userId,
        ...data,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from team ${socket.teamId}`);
      socket.leave(socket.teamId!);
    });
  });

  return io;
}; 