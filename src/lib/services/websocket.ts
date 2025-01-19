import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getSession } from 'next-auth/react';
import { Document } from '@/models/Document';
import { Team } from '@/models/Team';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    path: '/api/ws',
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const session = await getSession({ req: socket.request });
    if (!session?.user) {
      next(new Error('Unauthorized'));
      return;
    }
    socket.data.user = session.user;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join team room
    socket.on('join-team', (teamId: string) => {
      socket.join(`team:${teamId}`);
    });

    // Join document room
    socket.on('join-document', (documentId: string) => {
      socket.join(`document:${documentId}`);
    });

    // Document cursor position update
    socket.on('cursor-update', async (data: { 
      documentId: string;
      position: { line: number; ch: number };
    }) => {
      socket.to(`document:${data.documentId}`).emit('cursor-move', {
        userId: socket.data.user.id,
        userName: socket.data.user.name,
        position: data.position,
      });
    });

    // Document content update
    socket.on('document-update', async (data: {
      documentId: string;
      content: string;
      version: number;
    }) => {
      try {
        const document = await Document.findById(data.documentId);
        if (!document) return;

        document.content = data.content;
        document.version = data.version;
        document.versions.push({
          content: data.content,
          modifiedBy: socket.data.user.id,
          modifiedAt: new Date(),
          version: data.version,
        });

        await document.save();

        socket.to(`document:${data.documentId}`).emit('document-updated', {
          content: data.content,
          version: data.version,
          user: socket.data.user,
        });
      } catch (error) {
        console.error('Error updating document:', error);
      }
    });

    // Chat message
    socket.on('chat-message', async (data: {
      teamId: string;
      content: string;
      attachments?: string[];
    }) => {
      try {
        const team = await Team.findById(data.teamId);
        if (!team) return;

        const message = {
          content: data.content,
          author: socket.data.user.id,
          createdAt: new Date(),
          attachments: data.attachments || [],
          reactions: [],
          isPinned: false,
        };

        team.chat.messages.push(message);
        await team.save();

        io?.to(`team:${data.teamId}`).emit('new-message', {
          ...message,
          author: socket.data.user,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Task status update
    socket.on('task-update', async (data: {
      teamId: string;
      taskId: string;
      status: string;
    }) => {
      try {
        const team = await Team.findById(data.teamId);
        if (!team) return;

        const task = team.progress.tasks.id(data.taskId);
        if (!task) return;

        task.status = data.status;
        if (data.status === 'completed') {
          task.completedAt = new Date();
        }

        await team.save();

        io?.to(`team:${data.teamId}`).emit('task-updated', {
          taskId: data.taskId,
          status: data.status,
          updatedBy: socket.data.user,
        });
      } catch (error) {
        console.error('Error updating task:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

export function emitToTeam(teamId: string, event: string, data: any) {
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, data);
}

export function emitToDocument(documentId: string, event: string, data: any) {
  if (!io) return;
  io.to(`document:${documentId}`).emit(event, data);
} 