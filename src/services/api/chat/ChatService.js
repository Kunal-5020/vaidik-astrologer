// src/services/api/chat/ChatService.js (ASTRO APP)

import { apiClient } from '../axios.instance';
import { API_ENDPOINTS } from '../../../config/api.config';

const ChatService = {
  // Get session messages
  async getSessionMessages(sessionId, page = 1, limit = 50) {
    const url = API_ENDPOINTS.CHAT_GET_MESSAGES.replace(':sessionId', sessionId);
    const res = await apiClient.get(url, { params: { page, limit } });
    return res.data.data; // { messages, pagination }
  },

  // ✅ ADDED: Get Conversation Messages (History with Pagination)
  async getConversationMessages(orderId, page = 1, limit = 50) {
    const url = `/chat/astrologer/conversations/${orderId}/messages`;
    const res = await apiClient.get(url, { params: { page, limit } });
    return res.data; // Returns { success: true, data: { messages: [], pagination: {} } }
  },

  // End chat session (astrologer side)
  async endChatSession(sessionId, reason = 'astrologer_ended') {
    const res = await apiClient.post(API_ENDPOINTS.CHAT_END_SESSION, {
      sessionId,
      reason,
    });
    return res.data;
  },

  // Astrologer accepts chat
  async acceptChatAsAstrologer(sessionId) {
    const res = await apiClient.post(API_ENDPOINTS.ASTRO_CHAT_ACCEPT, {
      sessionId,
    });
    return res.data;
  },

  // Astrologer rejects chat
  async rejectChatAsAstrologer(sessionId, reason = 'busy') {
    const res = await apiClient.post(API_ENDPOINTS.ASTRO_CHAT_REJECT, {
      sessionId,
      reason,
    });
    return res.data;
  },

  async getConversationHistory(orderId, limit = 100) {
    const url = `/chat/astrologer/conversations/${orderId}/messages`;
    const res = await apiClient.get(url, { params: { limit } });
    return res.data.data;
  },

  // ⭐ NEW: Star message
  async starMessage(messageId, sessionId) {
    const url = `/chat/messages/${messageId}/star`;
    const res = await apiClient.post(url, { sessionId });
    return res.data;
  },

  // ⭐ NEW: Unstar message
  async unstarMessage(messageId, sessionId) {
    const url = `/chat/messages/${messageId}/star`;
    const res = await apiClient.delete(url, { data: { sessionId } });
    return res.data;
  },

  // ⭐ NEW: Get starred messages (for AstroStarredMessages screen)
  async getStarredMessages(sessionId, page = 1, limit = 50) {
    const url = `/chat/sessions/${sessionId}/starred`;
    const res = await apiClient.get(url, { params: { page, limit } });
    return res.data.data; // { messages, pagination }
  },

  // 🔍 NEW: Search messages
  async searchMessages(sessionId, query, page = 1, limit = 50) {
    const url = `/chat/sessions/${sessionId}/search`;
    const res = await apiClient.get(url, {
      params: { q: query, page, limit },
    });
    return res.data.data; // { messages, pagination }
  },

  async getTimerStatus(sessionId) {
    const url = `/chat/sessions/${sessionId}/timer-status`;
    const res = await apiClient.get(url);
    return res.data; // Should return { success: true, data: { status, remainingSeconds... } }
  },
};

export default ChatService;
