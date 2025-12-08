import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../../config/env';
import { STORAGE_KEYS } from '../../config/constants';

class AstrologerCallSocket {
  socket = null;
  connectionPromise = null;

  async connect() {
    if (this.socket?.connected) {
      console.log('✅ [AstroCall] Already connected:', this.socket.id);
      return this.socket;
    }
    if (this.connectionPromise) {
      console.log('⏳ [AstroCall] Connection in progress...');
      return this.connectionPromise;
    }

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

      let astroJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
      if (!astroJson) astroJson = await AsyncStorage.getItem('astrologer');
      if (!astroJson) astroJson = await AsyncStorage.getItem('astrologerData');

      const astrologer = astroJson ? JSON.parse(astroJson) : null;
      const astrologerId = astrologer?._id || astrologer?.id;

      if (!token || !astrologerId) {
        throw new Error('Missing token or astrologerId');
      }

      const SOCKET_URL = env.SOCKET_URL;
      console.log('🔌 [AstroCall] Connecting to:', `${SOCKET_URL}/calls`);

      this.socket = io(`${SOCKET_URL}/calls`, {
        transports: ['websocket'],
        auth: {
          token,
          userId: astrologerId,
          role: 'Astrologer',
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('AstroCall connect timeout')),
          10000,
        );

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('🟢 [AstroCall] Connected:', this.socket.id);
          resolve(this.socket);
        });

        this.socket.once('connect_error', (err) => {
          clearTimeout(timeout);
          console.error('🔴 [AstroCall] Connect error:', err.message);
          reject(err);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🟠 [AstroCall] Disconnected:', reason);
        });
      });
    } catch (err) {
      console.error('❌ [AstroCall] Connect failed:', err);
      this.socket = null;
      throw err;
    }
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 [AstroCall] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, cb) {
    if (!this.socket) {
      console.error('❌ [AstroCall] Cannot listen, socket not initialized');
      return;
    }
    this.socket.on(event, cb);
    console.log(`👂 [AstroCall] Listening to ${event}`);
  }

  off(event, cb) {
    if (!this.socket) return;
    this.socket.off(event, cb);
    console.log(`🔇 [AstroCall] Stopped listening to ${event}`);
  }

  emit(event, data, cb) {
    if (!this.socket?.connected) {
      console.error('❌ [AstroCall] Cannot emit, not connected');
      return;
    }
    console.log(`📤 [AstroCall] Emitting ${event}:`, data);
    this.socket.emit(event, data, cb);
  }

  // helpers
  joinSession(sessionId, astrologerId) {
    this.emit('join_session', { sessionId, userId: astrologerId, role: 'astrologer' });
  }

  endCall(sessionId, astrologerId, reason) {
    this.emit('end_call', { sessionId, endedBy: astrologerId, reason });
  }
}

export default new AstrologerCallSocket();
