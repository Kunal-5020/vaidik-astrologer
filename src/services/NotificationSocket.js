// src/services/NotificationSocket.js
import { io } from 'socket.io-client';
import env from '../config/env';

class NotificationSocket {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize and connect to notification socket
   * @param {string} token - JWT token
   * @param {string} deviceId - Device ID
   * @param {string} userType - 'user' or 'astrologer'
   */
  async connect(token, deviceId, userType = 'user') {
    try {
      // Disconnect existing connection
      if (this.socket) {
        this.disconnect();
      }

      const SOCKET_URL = env.SOCKET_URL; // Replace with your backend URL

      console.log('🔌 Connecting to notification socket...', { userType, deviceId });

      this.socket = io(`${SOCKET_URL}/notifications`, {
        auth: {
          token,
          deviceId,
          userType,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      this.setupEventHandlers();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Notification socket connected:', this.socket.id);
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Socket connection error:', error.message);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to connect notification socket:', error);
      throw error;
    }
  }

  /**
   * Setup socket event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('🔌 Socket connected:', this.socket.id);
      this.emit('socket-connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 Socket disconnected:', reason);
      this.emit('socket-disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('❌ Socket connection error:', error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.emit('socket-error', { error: 'Max reconnection attempts reached' });
      }
    });

    // Notification events
    this.socket.on('new-notification', (notification) => {
      console.log('📩 New notification received:', notification);
      this.emit('new-notification', notification);
    });

    this.socket.on('notification-read', (data) => {
      console.log('✅ Notification marked as read:', data);
      this.emit('notification-read', data);
    });

    this.socket.on('notifications-cleared', (data) => {
      console.log('🗑️ Notifications cleared:', data);
      this.emit('notifications-cleared', data);
    });

    // Admin events
    this.socket.on('broadcast', (data) => {
      console.log('📢 Broadcast received:', data);
      this.emit('broadcast', data);
    });

    this.socket.on('system-alert', (data) => {
      console.log('🚨 System alert received:', data);
      this.emit('system-alert', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('socket-error', error);
    });
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to registered listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead(notificationId) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('mark-as-read', { notificationId });
    console.log('✅ Marked notification as read:', notificationId);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('mark-all-as-read');
    console.log('✅ Marked all notifications as read');
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('clear-all-notifications');
    console.log('🗑️ Cleared all notifications');
  }

  /**
   * Request notification history
   * @param {number} limit - Number of notifications to fetch
   */
  requestHistory(limit = 20) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('request-history', { limit });
    console.log('📜 Requested notification history');
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting notification socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
const notificationSocket = new NotificationSocket();
export default notificationSocket;
