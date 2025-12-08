import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DeviceEventEmitter, Alert } from 'react-native';
import { notificationService } from '../services/api/notification.service';
import { useAuth } from './AuthContext'; // ✅ Import useAuth

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children, navigation }) => {
  const { isAuthenticated, astrologer } = useAuth(); // ✅ Get auth status

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications - ONLY if authenticated
  const loadNotifications = useCallback(async () => {
    // ✅ CHECK AUTH FIRST
    if (!isAuthenticated) {
      console.log('ℹ️ [NotifContext] Not authenticated, skipping load');
      return;
    }

    try {
      setLoading(true);
      console.log('📡 [NotifContext] Loading notifications...');
      
      const response = await notificationService.getNotifications();
      
      if (response.success) {
        console.log('✅ [NotifContext] Loaded:', response.data.notifications.length);
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('❌ [NotifContext] Load failed:', error.message);
      
      // Reset state on error (e.g., 401 Unauthorized)
      if (error.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load unread count - ONLY if authenticated
  const loadUnreadCount = useCallback(async () => {
    // ✅ CHECK AUTH FIRST
    if (!isAuthenticated) {
      console.log('ℹ️ [NotifContext] Not authenticated, skipping unread count');
      return;
    }

    try {
      console.log('📡 [NotifContext] Loading unread count...');
      
      const response = await notificationService.getUnreadCount();
      
      if (response.success) {
        console.log('✅ [NotifContext] Unread count:', response.data.unreadCount);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('❌ [NotifContext] Unread count failed:', error.message);
      
      // Reset on error
      if (error.response?.status === 401) {
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAsRead([notificationId]);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ [NotifContext] Mark read failed:', error.message);
    }
  }, [isAuthenticated]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAllAsRead();
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ [NotifContext] Mark all failed:', error.message);
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
      
      const wasUnread = notifications.find(n => n.notificationId === notificationId && !n.isRead);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ [NotifContext] Delete failed:', error.message);
    }
  }, [isAuthenticated, notifications]);

  // Clear all
  const clearAll = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await notificationService.clearAll();
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ [NotifContext] Clear all failed:', error.message);
    }
  }, [isAuthenticated]);

  // Handle notification navigation (astrologer-specific)
  const handleNotificationPress = useCallback((notification) => {
    if (!navigation) {
      console.warn('⚠️ [NotifContext] No navigation ref');
      return;
    }

    const { type, data, actionUrl } = notification;

    console.log('📲 [NotifContext] Handling press:', type);

    // Mark as read
    markAsRead(notification.notificationId);

    switch (type) {
      // ===== CHAT/MESSAGE =====
      case 'chat_message':
      case 'message_direct':
        if (data?.sessionId) {
          navigation.navigate('AstroChatRoom', {
            sessionId: data.sessionId,
            orderId: data.orderId,
            userId: data.userId || data.senderId,
            userName: data.userName || data.senderName || 'User',
          });
        }
        break;

      // ===== CALL =====
      case 'call_video':
      case 'call_audio':
      case 'call_incoming':
        console.log('📞 [NotifContext] Call notification - add your call screen navigation');
        break;

      // ===== PAYMENTS/EARNINGS =====
      case 'payment_success':
      case 'payout_processed':
      case 'wallet_recharged':
        navigation.navigate('Home', {
          screen: 'Earnings',
        });
        break;

      // ===== ORDERS =====
      case 'order_completed':
      case 'order_created':
        navigation.navigate('Home', {
          screen: 'Sessions',
        });
        break;

      // ===== PROFILE =====
      case 'astrologer_approved':
      case 'astrologer_rejected':
        navigation.navigate('Home', {
          screen: 'Profile',
        });
        break;

      // ===== LIVESTREAM =====
      case 'live_event_started':
      case 'stream_started':
        if (data?.streamId || data?.eventId) {
          navigation.navigate('Go-Live', {
            streamId: data.streamId || data.eventId,
          });
        }
        break;

      // ===== SYSTEM =====
      case 'system_promotional':
      case 'system_announcement':
        if (actionUrl) {
          handleDeepLink(actionUrl);
        }
        break;

      default:
        console.log('ℹ️ [NotifContext] No navigation for:', type);
    }
  }, [navigation, markAsRead]);

  // Deep link handler
  const handleDeepLink = (url) => {
    console.log('🔗 [NotifContext] Deep link:', url);
    
    if (url.startsWith('/') && navigation) {
      const parts = url.substring(1).split('/');
      const route = parts[0];
      
      const routeMap = {
        'earnings': { screen: 'Earnings' },
        'profile': { screen: 'Profile' },
        'sessions': { screen: 'Sessions' },
        'services': 'Services',
        'settings': 'Setting',
      };
      
      const target = routeMap[route];
      if (target) {
        if (typeof target === 'string') {
          navigation.navigate(target);
        } else {
          navigation.navigate('Home', target);
        }
      }
    }
  };

  // Listen for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = DeviceEventEmitter.addListener(
      'notification-received',
      (notification) => {
        console.log('📩 [NotifContext] New notification:', notification.type);

        // Add to list
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    );

    return () => subscription.remove();
  }, [isAuthenticated]);

  // ✅ Load notifications when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ [NotifContext] User authenticated, loading notifications');
      loadNotifications();
      loadUnreadCount();
    } else {
      console.log('❌ [NotifContext] User not authenticated, clearing notifications');
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [isAuthenticated, loadNotifications, loadUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    handleNotificationPress,
    refreshNotifications: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
