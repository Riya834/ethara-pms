const { Server } = require('socket.io');
const socketAuth = require('./middleware/socketAuth');
const { clientUrl } = require('../config/env');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl, methods: ['GET', 'POST'], credentials: true },
  });

  // Auth middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);

    // Join a project room
    socket.on('join:project', ({ projectId }) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:online', { userId: socket.user.id, name: socket.user.name });
      console.log(`📁 ${socket.user.name} joined project:${projectId}`);
    });

    socket.on('leave:project', ({ projectId }) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:offline', { userId: socket.user.id });
    });

    // Canvas events — ephemeral, no DB persistence for cursor
    socket.on('canvas:element_add', ({ element, canvasId, projectId }) => {
      socket.to(`project:${projectId}`).emit('canvas:element_add', { element, canvasId });
    });

    socket.on('canvas:element_update', ({ element, canvasId, projectId }) => {
      socket.to(`project:${projectId}`).emit('canvas:element_update', { element, canvasId });
    });

    socket.on('canvas:element_delete', ({ elementId, canvasId, projectId }) => {
      socket.to(`project:${projectId}`).emit('canvas:element_delete', { elementId, canvasId });
    });

    socket.on('canvas:cursor', ({ x, y, projectId, color }) => {
      socket.to(`project:${projectId}`).emit('canvas:cursor', {
        x, y, userId: socket.user.id, name: socket.user.name, color,
      });
    });

    socket.on('user:typing', ({ taskId, projectId }) => {
      socket.to(`project:${projectId}`).emit('user:typing', { taskId, userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user?.name}`);
    });
  });

  return io;
};

module.exports = initSocket;
