import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../../config/env';
import { STORAGE_KEYS } from '../../config/constants';

class AstrologerChatSocket {
  socket = null;
  connectionPromise = null;
  astrologerId = null;

  async connect() {
    if (this.socket?.connected) {
       // Re-register if needed
       if(this.astrologerId) this.socket.emit('register_astrologer', { astrologerId: this.astrologerId });
       return this.socket;
    }
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = this._establishConnection();
    return this.connectionPromise;
  }

  async _establishConnection() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const astroJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA) || await AsyncStorage.getItem('astrologer');
      const astrologer = astroJson ? JSON.parse(astroJson) : null;
      this.astrologerId = astrologer?._id || astrologer?.id;

      if (!token || !this.astrologerId) throw new Error('Missing token or astrologerId');

      console.log('🔌 [AstroChat] Connecting to:', `${env.SOCKET_URL}/chat`);

      // ✅ CONNECT TO /chat NAMESPACE
      this.socket = io(`${env.SOCKET_URL}/chat`, {
        transports: ['websocket'],
        auth: { token, userId: this.astrologerId, role: 'Astrologer' },
        reconnection: true,
      });

      return new Promise((resolve, reject) => {
        this.socket.once('connect', () => {
          console.log('✅ [AstroChat] Connected');
          this.socket.emit('register_astrologer', { astrologerId: this.astrologerId });
          this.connectionPromise = null;
          resolve(this.socket);
        });
        this.socket.once('connect_error', (err) => {
          console.error('❌ [AstroChat] Error:', err.message);
          this.connectionPromise = null;
          reject(err);
        });
      });
    } catch (err) {
      this.connectionPromise = null;
      throw err;
    }
  }

  joinSession(sessionId, astrologerId) {
    if (!this.socket?.connected) return;
    this.socket.emit('join_session', { sessionId, userId: astrologerId, role: 'astrologer' });
  }

  sendMessage(data) {
    if (!this.socket?.connected) return;
    // Backend expects specific fields
    this.socket.emit('send_message', {
      ...data,
      senderModel: 'Astrologer',
      receiverModel: 'User'
    });
  }

  markRead(messageIds, userId, sessionId) {
    if (!this.socket?.connected) return;
    this.socket.emit('mark_read', { messageIds, userId, sessionId });
  }

  typing(data) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', data);
  }

  endChat(data) {
    if (!this.socket?.connected) return;
    this.socket.emit('end_chat', data);
  }

  rejectChat(sessionId) {
    if (!this.socket?.connected) return;
    console.log('📤 [AstroChat] Rejecting chat:', sessionId);
    this.socket.emit('reject_chat', { sessionId });
  }

  on(event, cb) {
    this.socket?.on(event, cb);
  }

  off(event, cb) {
    this.socket?.off(event, cb);
  }
  
  emit(event, data) {
    this.socket?.emit(event, data);
  }
}

export default new AstrologerChatSocket();