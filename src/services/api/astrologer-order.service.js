// src/services/api/astrologer-order.service.js
import { apiClient } from './axios.instance';

/**
 * Normalized session object shape:
 * {
 *   id: string,
 *   orderId: string | null,
 *   type: 'chat' | 'call',
 *   status: string,
 *   startedAt: string | null,
 *   endedAt: string | null,
 *   durationSeconds: number,
 *   amount: number,
 *   user: {
 *     id: string | null,
 *     name: string | null,
 *     avatar: string | null,
 *     phoneNumber?: string | null,
 *   },
 *   lastPreview: string | null,
 *   lastInteractionAt: string | null,
 * }
 */

class AstrologerOrderService {
  /**
   * ✅ Get astrologer orders (from OrdersController.getAstrologerOrders)
   * Backend: GET /orders/astrologer/my-orders
   * Query: ?page=1&limit=20&status=completed&type=conversation|call|chat
   */
  async getAstrologerOrders({ page = 1, limit = 20, status, type } = {}) {
    try {

      const params = { page, limit };
      if (status) params.status = status;
      if (type) params.type = type;

      const res = await apiClient.get('/orders/astrologer/my-orders', { params });

      // Backend already returns: { success, data: orders, pagination }
      const ok = res.data?.success !== false;
      const data = ok ? res.data.data : { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      console.log('[AstroOrders] Fetched orders:', data.orders);
      return {
        success: ok,
        orders: data.orders || [],
        pagination: data.pagination || { page, limit, total: 0, pages: 0 },
      };
    } catch (error) {
      console.error('[AstroOrders] getAstrologerOrders error:', error?.response?.data || error);
      throw error;
    }
  }

  /**
   * ✅ Get astrologer chat sessions
   * Backend: ChatController.getAstrologerChatSessions
   * GET /chat/astrologer/sessions?status=active|ended|pending...
   */
  async getAstrologerChatSessions({ page = 1, limit = 20, status } = {}) {
    try {
      console.log('[AstroOrders] Fetching astrologer CHAT sessions...', { page, limit, status });

      const params = { page, limit };
      if (status) params.status = status;

      const res = await apiClient.get('/chat/astrologer/sessions', { params });
      console.log('[AstroOrders] Raw chat sessions response:', res.data);

      const ok = res.data?.success !== false;
      // Some controllers return { success, data: { sessions, pagination } }
      const payload = res.data?.data || res.data || {};
      const sessions = payload.sessions || payload.data || payload || [];
      const pagination = payload.pagination || { page, limit, total: sessions.length, pages: 1 };

      const mapped = sessions.map((s) => ({
        id: s.sessionId || s.id,
        orderId: s.orderId || null,
        type: 'chat',
        status: s.status,
        startedAt: s.startTime || s.startedAt || null,
        endedAt: s.endTime || s.endedAt || null,
        durationSeconds: s.duration || s.durationSeconds || 0,
        amount: s.totalAmount || s.billingAmount || 0,
        user: {
          id: s.userId?.id || s.userId || null,
          name: s.userName || s.userId?.name || 'User',
          avatar: s.userId?.profileImage || s.userId?.profilePicture || null,
          phoneNumber: s.userId?.phoneNumber || null,
        },
        lastPreview:
          s.lastMessagePreview ||
          s.lastMessage ||
          (s.lastMessage?.content ?? null),
        lastInteractionAt:
          s.lastInteractionAt ||
          s.endTime ||
          s.startTime ||
          s.createdAt ||
          null,
        raw: s,
      }));

      return {
        success: ok,
        sessions: mapped,
        pagination,
      };
    } catch (error) {
      console.error('[AstroOrders] getAstrologerChatSessions error:', error?.response?.data || error);
      throw error;
    }
  }

  /**
   * Combined history for astrologer chats + calls
   * Uses:
   *   - GET /chat/astrologer/sessions
   *   - GET /calls/astrologer/sessions
   * Optional query: ?status=active|ended|pending...
   */
  async getAstrologerSessions({ page = 1, limit = 20, status } = {}) {
    try {

      const params = { page, limit };
      if (status) params.status = status;

      // apiClient must be a configured Axios instance (no `.get` error)
      const [chatRes, callRes] = await Promise.all([
        apiClient.get('/chat/astrologer/sessions', { params }),
        apiClient.get('/calls/astrologer/sessions', { params }),
      ]);

      console.log('[AstroOrders] Raw chat sessions response:', chatRes.data);
      console.log('[AstroOrders] Raw call sessions response:', callRes.data);

      const chatOk = chatRes.data?.success !== false;
      const callOk = callRes.data?.success !== false;

      const chatItems = chatOk
        ? chatRes.data.data.sessions
        : [];

      const callItems = callOk
        ? callRes.data.data.sessions
        : [];

      // Normalize chat sessions
      const chatMapped = chatItems.map((s) => ({
        id: s.sessionId || s._id,
        orderId: s.orderId,
        type: 'chat',
        status: s.status,
        startedAt: s.startTime || s.startedAt,
        endedAt: s.endTime || s.endedAt,
        durationSeconds: s.duration || s.totalDurationSeconds || 0,
        amount: s.totalAmount || s.billingAmount || 0,
        user: {
          id: s.userId?._id || s.userId || '',
          name: s.userName || s.userId?.name || 'User',
        },
        lastPreview:
          s.lastMessagePreview ||
          s.lastMessage ||
          'Chat session',
        lastInteractionAt:
          s.lastInteractionAt ||
          s.endTime ||
          s.startTime,
      }));

      // Normalize call sessions
      const callMapped = callItems.map((s) => ({
        id: s.sessionId || s._id,
        orderId: s.orderId,
        type: 'call',
        status: s.status,
        startedAt: s.startTime,
        endedAt: s.endTime,
        durationSeconds: s.duration || 0,
        amount: s.totalAmount || s.billingAmount || 0,
        user: {
          id: s.userId?._id || s.userId || '',
          name: s.userName || s.userId?.name || 'User',
        },
        lastPreview: s.callType
          ? `${s.callType.toUpperCase()} call`
          : 'Call session',
        lastInteractionAt:
          s.lastInteractionAt ||
          s.endTime ||
          s.startTime,
      }));

      const all = [...chatMapped, ...callMapped].sort((a, b) => {
        const t1 = new Date(a.lastInteractionAt || a.startedAt || 0).getTime();
        const t2 = new Date(b.lastInteractionAt || b.startedAt || 0).getTime();
        return t2 - t1;
      });

      const totalEarned = all.reduce(
        (sum, s) => sum + (s.amount || 0),
        0,
      );

      return {
        success: true,
        data: {
          sessions: all,
          totalEarned,
          chatCount: chatMapped.length,
          callCount: callMapped.length,
        },
      };
    } catch (error) {
      console.error('❌ [AstroOrders] getAstrologerSessions error:', error);
      throw error;
    }
  }
}

const astrologerOrderService = new AstrologerOrderService();
export default astrologerOrderService;
