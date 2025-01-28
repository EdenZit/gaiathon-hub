const { Server } = require('socket.io');
const { createServer } = require('http');
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Create HTTP server
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  // TODO: Implement proper token verification
  socket.user = { email: token };
  next();
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.email);

  // Join team rooms
  socket.on('joinTeam', (teamId) => {
    socket.join(`team:${teamId}`);
    console.log(`User ${socket.user.email} joined team ${teamId}`);
  });

  // Leave team rooms
  socket.on('leaveTeam', (teamId) => {
    socket.leave(`team:${teamId}`);
    console.log(`User ${socket.user.email} left team ${teamId}`);
  });

  // Handle new messages
  socket.on('sendMessage', async (data) => {
    const { teamId, content } = data;
    if (!teamId || !content) return;

    try {
      // TODO: Save message to database
      const message = {
        id: new mongoose.Types.ObjectId().toString(),
        content,
        sender: {
          id: socket.user.email,
          firstName: 'User', // TODO: Get from database
          lastName: '',
        },
        teamId,
        createdAt: new Date().toISOString(),
      };

      // Broadcast message to team room
      io.to(`team:${teamId}`).emit('newMessage', message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { teamId, isTyping } = data;
    socket.to(`team:${teamId}`).emit('userTyping', {
      userId: socket.user.email,
      isTyping,
    });
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.email);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 