import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  async connect() {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@taskmaster:token');

      if (!token) {
        console.log('No token found, cannot connect to socket');
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.connected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message);
        this.connected = false;
      });

      // Handle incoming events
      this.socket.on('new_message', (data) => {
        this.emit('new_message', data);
      });

      this.socket.on('new_notification', (data) => {
        this.emit('new_notification', data);
      });

      this.socket.on('message_read', (data) => {
        this.emit('message_read', data);
      });

      this.socket.on('typing', (data) => {
        this.emit('typing', data);
      });

      this.socket.on('stop_typing', (data) => {
        this.emit('stop_typing', data);
      });

    } catch (error) {
      console.error('Error connecting socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log('Socket disconnected manually');
    }
  }

  // Join a task room
  joinTaskRoom(taskId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_task_room', { taskId });
      console.log('Joined task room:', taskId);
    }
  }

  // Leave a task room
  leaveTaskRoom(taskId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_task_room', { taskId });
      console.log('Left task room:', taskId);
    }
  }

  // Send a message
  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', data);
    }
  }

  // Send typing indicator
  sendTyping(taskId, receiverId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { taskId, receiverId });
    }
  }

  // Send stop typing indicator
  sendStopTyping(taskId, receiverId) {
    if (this.socket && this.connected) {
      this.socket.emit('stop_typing', { taskId, receiverId });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;
