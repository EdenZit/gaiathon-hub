import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getSession } from 'next-auth/react';
import { Team } from '@/models/Team';
import { connectDB } from '@/lib/mongodb';

let io: SocketIOServer | null = null;

interface SharedUser {
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
}

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  documentId: string;
}

interface DocumentUpdate {
  documentId: string;
  content: string;
  version: number;
  userId: string;
}

interface ChatMessage {
  teamId: string;
  content: string;
  userId: string;
  userName: string;
  threadId?: string;
  attachments?: {
    type: string;
    url: string;
  }[];
}

interface ChatMessageDB {
  _id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  timestamp: Date;
  threadId?: string;
  attachments?: {
    type: string;
    url: string;
  }[];
  reactions: {
    emoji: string;
    users: string[];
  }[];
  replies?: ChatMessageDB[];
}

interface TaskUpdate {
  taskId: string;
  status: string;
  userId: string;
  userName: string;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const session = await getSession({ req: socket.request });
      if (!session?.user?.id) {
        return next(new Error('Unauthorized'));
      }
      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name || '';
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Join team room
    socket.on('join-team', async (teamId: string) => {
      try {
        await connectDB();
        const team = await Team.findOne({
          _id: teamId,
          'members.userId': socket.data.userId,
        });

        if (team) {
          socket.join(`team:${teamId}`);
          console.log(`User ${socket.data.userId} joined team ${teamId}`);
        }
      } catch (error) {
        console.error('Error joining team:', error);
      }
    });

    // Join document room
    socket.on('join-document', async (documentId: string) => {
      try {
        await connectDB();
        const team = await Team.findOne({
          'documents._id': documentId,
          'members.userId': socket.data.userId,
        });

        if (team) {
          const document = team.documents.id(documentId);
          const hasAccess = document?.sharedWith?.some(
            (share: SharedUser) => share.userId.toString() === socket.data.userId
          ) || document?.createdBy.toString() === socket.data.userId;

          if (hasAccess) {
            socket.join(`document:${documentId}`);
            console.log(`User ${socket.data.userId} joined document ${documentId}`);
          }
        }
      } catch (error) {
        console.error('Error joining document:', error);
      }
    });

    // Handle cursor position updates
    socket.on('cursor-update', (data: CursorPosition) => {
      socket.broadcast
        .to(`document:${data.documentId}`)
        .emit('cursor-moved', {
          x: data.x,
          y: data.y,
          userId: socket.data.userId,
          userName: socket.data.userName,
        });
    });

    // Handle document content updates
    socket.on('document-update', async (data: DocumentUpdate) => {
      try {
        await connectDB();
        const team = await Team.findOne({
          'documents._id': data.documentId,
        });

        if (team) {
          const document = team.documents.id(data.documentId);
          if (document) {
            // Check if user has edit access
            const hasEditAccess = 
              document.createdBy.toString() === socket.data.userId ||
              document.sharedWith?.some(
                (share: SharedUser) => 
                  share.userId.toString() === socket.data.userId && 
                  ['editor', 'owner'].includes(share.role)
              );

            if (hasEditAccess) {
              // Update document content
              document.content = data.content;
              document.version = data.version;
              document.lastModified = new Date();
              document.versions.push({
                content: data.content,
                modifiedBy: socket.data.userId,
                modifiedAt: new Date(),
                version: data.version,
              });

              await team.save();

              // Notify other clients
              socket.broadcast
                .to(`document:${data.documentId}`)
                .emit('document-updated', {
                  content: data.content,
                  version: data.version,
                  userId: socket.data.userId,
                  userName: socket.data.userName,
                });
            }
          }
        }
      } catch (error) {
        console.error('Error updating document:', error);
      }
    });

    // Handle chat messages
    socket.on('chat-message', async (data: ChatMessage) => {
      try {
        await connectDB();
        const team = await Team.findById(data.teamId);

        if (team) {
          // Add message to chat history
          const newMessage = {
            content: data.content,
            author: {
              id: socket.data.userId,
              name: socket.data.userName,
            },
            timestamp: new Date(),
            threadId: data.threadId,
            attachments: data.attachments,
            reactions: [],
          };

          if (data.threadId) {
            // Add to existing thread
            const parentMessage = team.chat.messages.find(
              (msg: ChatMessageDB) => msg._id.toString() === data.threadId
            );
            if (parentMessage) {
              parentMessage.replies = parentMessage.replies || [];
              parentMessage.replies.push(newMessage);
            }
          } else {
            // Add as new message
            team.chat.messages.push(newMessage);
          }

          await team.save();

          // Broadcast to team members
          io?.to(`team:${data.teamId}`).emit('chat-message-received', {
            ...newMessage,
            teamId: data.teamId,
          });
        }
      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    // Handle task updates
    socket.on('task-update', async (data: TaskUpdate) => {
      try {
        await connectDB();
        const team = await Team.findOne({
          'progress.tasks._id': data.taskId,
        });

        if (team) {
          const task = team.progress.tasks.id(data.taskId);
          if (task) {
            task.status = data.status;
            task.lastUpdated = new Date();

            // Add activity log
            team.activity.unshift({
              type: 'progress',
              action: `Updated task status to ${data.status}`,
              details: {
                user: {
                  name: socket.data.userName,
                  id: socket.data.userId,
                },
                title: task.title,
              },
              timestamp: new Date(),
              isRead: false,
            });

            await team.save();

            // Notify team members
            io?.to(`team:${team._id}`).emit('task-status-changed', {
              taskId: data.taskId,
              status: data.status,
              userId: socket.data.userId,
              userName: socket.data.userName,
            });
          }
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitToTeam(teamId: string, event: string, data: any) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  io.to(`team:${teamId}`).emit(event, data);
}

export function emitToDocument(documentId: string, event: string, data: any) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  io.to(`document:${documentId}`).emit(event, data);
} 