// src/services/socket/AstrologerChatSocket.js (ASTROLOGER APP - FIXED)
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../../config/env';
import { STORAGE_KEYS } from '../../config/constants';

class AstrologerChatSocket {
  socket = null;
  connectionPromise = null;

  async connect() {
    // ✅ Return existing connection if already connected
    if (this.socket?.connected) {
      console.log('✅ [AstroSocket] Already connected:', this.socket.id);
      return this.socket;
    }

    // ✅ Return pending connection promise if connecting
    if (this.connectionPromise) {
      console.log('⏳ [AstroSocket] Connection in progress...');
      return this.connectionPromise;
    }

    // ✅ Create new connection
    this.connectionPromise = this._establishConnection();
    
    try {
      const socket = await this.connectionPromise;
      return socket;
    } finally {
      this.connectionPromise = null;
    }
  }

  async _establishConnection() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Try multiple keys for astrologer data
      let astroJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
      if (!astroJson) astroJson = await AsyncStorage.getItem('astrologer');
      if (!astroJson) astroJson = await AsyncStorage.getItem('astrologerData');
      
      console.log('🔍 [AstroSocket] Token found:', !!token);
      console.log('🔍 [AstroSocket] Astrologer data found:', !!astroJson);
      
      const astrologer = astroJson ? JSON.parse(astroJson) : null;
      const astrologerId = astrologer?._id || astrologer?.id;

      if (!token || !astrologerId) {
        throw new Error('Missing token or astrologerId');
      }

      const SOCKET_URL = env.SOCKET_URL;
      console.log('🔌 [AstroSocket] Connecting to:', `${SOCKET_URL}/chat`);

      this.socket = io(`${SOCKET_URL}/chat`, {
        transports: ['websocket'],
        auth: {
          token,
          userId: astrologerId,
          role: 'Astrologer',  // ✅ CRITICAL for auto-registration
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      // ✅ CRITICAL: Wait for connection to establish
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 10s'));
        }, 10000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('🟢 [AstroSocket] Connected:', this.socket.id);
          resolve(this.socket);
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('🔴 [AstroSocket] Connection error:', error.message);
          reject(error);
        });

        // Setup persistent listeners
        this.socket.on('disconnect', (reason) => {
          console.log('🟠 [AstroSocket] Disconnected:', reason);
        });
      });
    } catch (error) {
      console.error('❌ [AstroSocket] Connect failed:', error);
      this.socket = null;
      throw error;
    }
  }

  // ✅ NEW: Get socket instance
  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 [AstroSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, cb) {
    if (!this.socket) {
      console.error('❌ [AstroSocket] Cannot listen, socket not initialized');
      return;
    }
    this.socket.on(event, cb);
    console.log(`👂 [AstroSocket] Listening to ${event}`);
  }

  off(event, cb) {
    if (!this.socket) return;
    this.socket.off(event, cb);
    console.log(`🔇 [AstroSocket] Stopped listening to ${event}`);
  }

  emit(event, data, cb) {
    if (!this.socket?.connected) {
      console.error('❌ [AstroSocket] Cannot emit, not connected');
      return;
    }
    console.log(`📤 [AstroSocket] Emitting ${event}:`, data);
    this.socket.emit(event, data, cb);
  }

  // ✅ Helper methods
  joinSession(sessionId, astrologerId) {
    this.emit('join_session', { 
      sessionId, 
      userId: astrologerId, 
      role: 'astrologer',
    });
  }

  acceptChat(sessionId, astrologerId) {
    this.emit('accept_chat', { sessionId, astrologerId });
  }

  rejectChat(sessionId, astrologerId, reason = 'busy') {
    this.emit('reject_chat', { sessionId, astrologerId, reason });
  }

  startSession(sessionId, astrologerId) {
    this.emit('start_chat', { 
      sessionId, 
      userId: astrologerId, 
      role: 'astrologer',
    });
  }

  sendMessage({ sessionId, astrologerId, userId, orderId, content, type = 'text' }) {
    this.emit('send_message', {
      sessionId,
      senderId: astrologerId,
      senderModel: 'Astrologer',
      receiverId: userId,
      receiverModel: 'User',
      orderId,
      type,
      content,
      message: content,
    });
  }
  // Add after your existing helper methods

sendTyping(sessionId, userId, isTyping) {
  this.emit('typing', {
    sessionId,
    userId,
    isTyping,
  });
}

starMessage(messageId, sessionId, userId) {
  this.emit('star_message', {
    messageId,
    sessionId,
    userId,
  });
}

unstarMessage(messageId, sessionId, userId) {
  this.emit('unstar_message', {
    messageId,
    sessionId,
    userId,
  });
}

deleteMessage(messageId, sessionId, senderId, deleteFor) {
  this.emit('delete_message', {
    messageId,
    sessionId,
    senderId,
    deleteFor,
  });
}

syncTimer(sessionId) {
  this.emit('sync_timer', { sessionId });
}

updateStatus(sessionId, userId, role, isOnline) {
  this.emit('update_status', {
    sessionId,
    userId,
    role,
    isOnline,
  });
}

}

export default new AstrologerChatSocket();
