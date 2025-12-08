import { apiClient } from './axios.instance';

class NotificationService {
  /**
   * Get astrologer's notifications
   * API: GET /notifications
   */
  async getNotifications(params = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = params;

      console.log('📡 [NotifService] Fetching notifications...', { page, limit, unreadOnly });

      const response = await apiClient.get('/notifications', {
        params: { page, limit, unreadOnly },
      });

      if (response.data.success) {
        console.log('✅ [NotifService] Fetched:', response.data.data.notifications.length);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch notifications');
    } catch (error) {
      console.error('❌ [NotifService] Get notifications error:', error.message);
      throw error;
    }
  }

  /**
   * Get unread count
   * API: GET /notifications/unread-count
   */
  async getUnreadCount() {
    try {
      console.log('📡 [NotifService] Fetching unread count...');

      const response = await apiClient.get('/notifications/unread-count');

      if (response.data.success) {
        console.log('✅ [NotifService] Unread count:', response.data.data.unreadCount);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch unread count');
    } catch (error) {
      console.error('❌ [NotifService] Get unread count error:', error.message);
      throw error;
    }
  }

  /**
   * Mark notification(s) as read
   * API: PATCH /notifications/mark-read
   */
  async markAsRead(notificationIds) {
    try {
      console.log('📡 [NotifService] Marking as read:', notificationIds);

      const response = await apiClient.patch('/notifications/mark-read', {
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds],
      });

      if (response.data.success) {
        console.log('✅ [NotifService] Marked as read');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to mark as read');
    } catch (error) {
      console.error('❌ [NotifService] Mark as read error:', error.message);
      throw error;
    }
  }

  /**
   * Mark all as read
   * API: PATCH /notifications/mark-all-read
   */
  async markAllAsRead() {
    try {
      console.log('📡 [NotifService] Marking all as read...');

      const response = await apiClient.patch('/notifications/mark-all-read');

      if (response.data.success) {
        console.log('✅ [NotifService] All marked as read');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to mark all as read');
    } catch (error) {
      console.error('❌ [NotifService] Mark all as read error:', error.message);
      throw error;
    }
  }

  /**
   * Delete notification
   * API: DELETE /notifications/:notificationId
   */
  async deleteNotification(notificationId) {
    try {
      console.log('📡 [NotifService] Deleting:', notificationId);

      const response = await apiClient.delete(`/notifications/${notificationId}`);

      if (response.data.success) {
        console.log('✅ [NotifService] Deleted');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to delete notification');
    } catch (error) {
      console.error('❌ [NotifService] Delete error:', error.message);
      throw error;
    }
  }

  /**
   * Clear all notifications
   * API: DELETE /notifications/clear-all
   */
  async clearAll() {
    try {
      console.log('📡 [NotifService] Clearing all...');

      const response = await apiClient.delete('/notifications/clear-all');

      if (response.data.success) {
        console.log('✅ [NotifService] All cleared');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to clear all');
    } catch (error) {
      console.error('❌ [NotifService] Clear all error:', error.message);
      throw error;
    }
  }

  /**
   * Helper: Extract error message
   */
  extractErrorMessage(error) {
    if (!error.response?.data) {
      return error.message || 'An error occurred';
    }

    const data = error.response.data;

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(e => e.message || e).join(', ');
    }

    if (typeof data.message === 'string') {
      return data.message;
    }

    return data.error || error.message || 'Operation failed';
  }
}

export const notificationService = new NotificationService();
