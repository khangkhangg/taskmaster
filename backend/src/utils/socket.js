const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Initialize Socket.io with authentication
 */
const initializeSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room for notifications
    socket.join(socket.userId);

    // Join task room
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      console.log(`User ${socket.userId} joined task ${taskId}`);
    });

    // Leave task room
    socket.on('leave_task', (taskId) => {
      socket.leave(`task_${taskId}`);
      console.log(`User ${socket.userId} left task ${taskId}`);
    });

    // Send message (real-time)
    socket.on('send_message', (data) => {
      const { taskId, receiverId, message } = data;

      // Emit to receiver
      io.to(receiverId).emit('new_message', {
        taskId,
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });

      // Emit to task room
      io.to(`task_${taskId}`).emit('message_sent', {
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { taskId, receiverId } = data;
      io.to(receiverId).emit('user_typing', {
        taskId,
        userId: socket.userId
      });
    });

    // Stop typing indicator
    socket.on('stop_typing', (data) => {
      const { taskId, receiverId } = data;
      io.to(receiverId).emit('user_stop_typing', {
        taskId,
        userId: socket.userId
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
