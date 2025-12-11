import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../../config/env';
import { STORAGE_KEYS } from '../../config/constants';

class AstrologerCallSocket {
  socket = null;
  connectionPromise = null;
  astrologerId = null;

  async connect() {
    if (this.socket?.connected) {
      // ✅ Ensure registration even if already connected (in case of re-mounts)
      if (this.astrologerId) {
        this.emit('register_astrologer', { astrologerId: this.astrologerId });
      }
      return this.socket;
    }

    if (this.connectionPromise) {
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
      
      const astrologer = astroJson ? JSON.parse(astroJson) : null;
      this.astrologerId = astrologer?._id || astrologer?.id;

      if (!token || !this.astrologerId) {
        throw new Error('Missing token or astrologerId');
      }

      const SOCKET_URL = env.SOCKET_URL;
      console.log('🔌 [AstroCall] Connecting to:', `${SOCKET_URL}/calls`);

      this.socket = io(`${SOCKET_URL}/calls`, {
        transports: ['websocket'],
        auth: {
          token,
          userId: this.astrologerId,
          role: 'Astrologer',
        },
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('AstroCall connect timeout'));
        }, 10000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('🟢 [AstroCall] Connected:', this.socket.id);

          // ✅ CRITICAL FIX: Register Astrologer immediately on connect
          this.emit('register_astrologer', { astrologerId: this.astrologerId });
          console.log('📝 [AstroCall] Registered as:', this.astrologerId);

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
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, cb) {
    if (!this.socket) return;
    this.socket.on(event, cb);
  }

  off(event, cb) {
    if (!this.socket) return;
    this.socket.off(event, cb);
  }

  emit(event, data, cb) {
    if (!this.socket?.connected) return;
    console.log(`📤 [AstroCall] Emitting ${event}`, data);
    if (cb) {
        this.socket.emit(event, data, cb);
    } else {
        this.socket.emit(event, data);
    }
  }

  // Helpers
  joinSession(sessionId, astrologerId) {
    this.emit('join_session', { sessionId, userId: astrologerId, role: 'astrologer' });
  }

  endCall(sessionId, astrologerId, reason) {
    this.emit('end_call', { sessionId, endedBy: astrologerId, reason });
  }
}

export default new AstrologerCallSocket();