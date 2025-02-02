import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getSession } from 'next-auth/react';
import { Document } from '@/models/Document';
import { rateLimit } from '@/lib/services/redis';

interface DocumentUpdate {
  documentId: string;
  content: string;
  version: number;
  userId: string;
}

interface CollaboratorUpdate {
  documentId: string;
  userId: string;
}

export class SocketService {
  private io: SocketIOServer;
  private static instance: SocketService;

  private constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      }
    });

    this.io.use(async (socket: Socket, next) => {
      try {
        const session = await getSession({ req: socket.request });
        if (!session) {
          return next(new Error('Unauthorized'));
        }
        
        // Apply rate limiting
        const identifier = `socket:${session.user.id}`;
        const { success } = await rateLimit.limit(identifier);
        if (!success) {
          return next(new Error('Rate limit exceeded'));
        }

        socket.data.userId = session.user.id;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.setupEventHandlers();
  }

  public static getInstance(server?: HTTPServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join document room
      socket.on('join-document', async ({ documentId }: { documentId: string }) => {
        try {
          const document = await Document.findById(documentId);
          if (!document) {
            socket.emit('error', { message: 'Document not found' });
            return;
          }

          // Check access rights
          if (!this.canAccessDocument(document, socket.data.userId)) {
            socket.emit('error', { message: 'Unauthorized access' });
            return;
          }

          socket.join(documentId);
          this.updateActiveCollaborators(documentId, socket.data.userId, true);
          
          // Broadcast to others in the room
          socket.to(documentId).emit('collaborator-joined', {
            userId: socket.data.userId,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error joining document:', error);
          socket.emit('error', { message: 'Failed to join document' });
        }
      });

      // Handle document updates
      socket.on('document-update', async (update: DocumentUpdate) => {
        try {
          const document = await Document.findById(update.documentId);
          if (!document || !this.canAccessDocument(document, socket.data.userId)) {
            socket.emit('error', { message: 'Unauthorized access' });
            return;
          }

          // Update document
          await Document.findByIdAndUpdate(update.documentId, {
            content: update.content,
            version: update.version,
            lastEditedBy: socket.data.userId,
            $push: {
              editHistory: {
                user: socket.data.userId,
                changes: update.content,
                timestamp: new Date()
              }
            }
          });

          // Broadcast to others in the room
          socket.to(update.documentId).emit('document-updated', update);
        } catch (error) {
          console.error('Error updating document:', error);
          socket.emit('error', { message: 'Failed to update document' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach(async (room) => {
          if (room !== socket.id) {
            await this.updateActiveCollaborators(room, socket.data.userId, false);
            socket.to(room).emit('collaborator-left', {
              userId: socket.data.userId,
              timestamp: new Date()
            });
          }
        });
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private async updateActiveCollaborators(
    documentId: string,
    userId: string,
    isJoining: boolean
  ): Promise<void> {
    try {
      if (isJoining) {
        await Document.findByIdAndUpdate(documentId, {
          $push: {
            activeCollaborators: {
              user: userId,
              lastActive: new Date()
            }
          }
        });
      } else {
        await Document.findByIdAndUpdate(documentId, {
          $pull: {
            activeCollaborators: {
              user: userId
            }
          }
        });
      }
    } catch (error) {
      console.error('Error updating active collaborators:', error);
    }
  }

  private canAccessDocument(document: any, userId: string): boolean {
    return (
      document.owner.toString() === userId ||
      document.collaborators.some((c: any) => c.toString() === userId) ||
      document.visibility === 'public' ||
      (document.visibility === 'team' && document.team)
    );
  }
}

export default SocketService; 