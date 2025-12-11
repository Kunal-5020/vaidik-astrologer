import { io } from 'socket.io-client';
import env from '../config/env'; // Ensure this points to your environment config
import { AppState } from 'react-native';

class NotificationSocket {
  constructor() {
    this.socket = null;
    this.connectionPromise = null;
    this.token = null;
    this.deviceId = null;
    this.userType = null;
    this.listeners = new Map();
  }

  /**
   * Establishes a connection to the Notification Gateway.
   * Handles singleton behavior and re-connection logic.
   */
  async connect(token, deviceId, userType = 'User') {
    // 1. If socket is already connected with same credentials, do nothing
    if (this.socket?.connected && this.token === token) {
      console.log('✅ [NotificationSocket] Already connected');
      return this.socket;
    }

    // 2. Update credentials
    this.token = token;
    this.deviceId = deviceId;
    this.userType = userType;

    // 3. If a connection is in progress, return that promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // 4. Force disconnect if existing socket exists but tokens changed
    if (this.socket) {
      this.disconnect();
    }

    this.connectionPromise = this._initSocket();
    return this.connectionPromise;
  }

  async _initSocket() {
    try {
      if (!this.token || !this.deviceId) {
        throw new Error('Missing token or deviceId for NotificationSocket');
      }

      const SOCKET_URL = `${env.SOCKET_URL}/notifications`; // Namespace from backend
      console.log(`🔌 [NotificationSocket] Connecting to ${SOCKET_URL} as ${this.userType}...`);

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token: this.token,
          deviceId: this.deviceId,
        },
        query: {
          deviceId: this.deviceId, // Backend checks here too
        },
        reconnection: true,
        reconnectionAttempts: Infinity, // Keep trying indefinitely
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
      });

      return new Promise((resolve, reject) => {
        // --- System Events ---

        this.socket.on('connect', () => {
          console.log(`🟢 [NotificationSocket] Connected (${this.socket.id})`);
          this.connectionPromise = null;
          this._resubscribeListeners();
          resolve(this.socket);
        });

        this.socket.on('connection-success', (data) => {
          console.log('✨ [NotificationSocket] Handshake success:', data.message);
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`🟠 [NotificationSocket] Disconnected: ${reason}`);
          if (reason === 'io server disconnect') {
            // Server disconnected us manually, try reconnecting
            this.socket.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error(`🔴 [NotificationSocket] Connection Error: ${error.message}`);
          // Don't reject immediately, let reconnection logic handle it.
          // Only reject if it's the initial attempt timing out.
        });

        // --- Custom Business Events ---

        this.socket.on('new-notification', (notification) => {
          console.log('🔔 [NotificationSocket] Received:', notification.type);
          
          // 1. Acknowledge receipt to backend
          this.notifyReceived(notification.notificationId);

          // 2. Broadcast to app listeners
          this._emitLocal('new-notification', notification);
        });
      });
    } catch (error) {
      console.error('❌ [NotificationSocket] Init failed:', error);
      this.connectionPromise = null;
      throw error;
    }
  }

  /**
   * Disconnects the socket manually.
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 [NotificationSocket] Disconnecting manualy...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Checks if socket is connected
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Subscribe to local events (e.g. 'new-notification')
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // If socket exists, attach listener directly if it's a socket.io event
    if (this.socket && event !== 'new-notification') {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.socket && event !== 'new-notification') {
      this.socket.off(event, callback);
    }
  }

  /**
   * Internal: Emit event to local listeners
   */
  _emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
  }

  /**
   * Internal: Re-attach socket.io specific listeners on reconnect
   */
  _resubscribeListeners() {
    // Logic to ensure listeners persist across reconnections
  }

  // ==========================================
  // BACKEND ACTIONS
  // ==========================================

  /**
   * Tell backend we received the notification
   */
  notifyReceived(notificationId) {
    if (this.socket?.connected && notificationId) {
      this.socket.emit('notification-received', { notificationId });
    }
  }

  /**
   * Mark notifications as read
   */
  markAsRead(notificationIds = []) {
    if (this.socket?.connected && notificationIds.length > 0) {
      this.socket.emit('mark-as-read', { notificationIds });
    }
  }
}

// Export Singleton
export default new NotificationSocket();