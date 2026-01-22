// src/screens/user/NotificationScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { notificationService } from '../../services/api/notification.service';
import { styles } from '../../style/NotificationStyle';

// Helper: Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return notifTime.toLocaleDateString();
};

// Helper: Get icon for notification type
const getNotificationIcon = (type) => {
  const icons = {
    order_created: { name: 'clipboard-check', color: '#3B82F6' },
    order_completed: { name: 'check-circle', color: '#10B981' },
    payment_success: { name: 'check-decagram', color: '#10B981' },
    payment_failed: { name: 'close-circle', color: '#EF4444' },
    wallet_recharged: { name: 'wallet-plus', color: '#10B981' },
    low_balance: { name: 'wallet-outline', color: '#F59E0B' },
    low_balance_warning: { name: 'alert', color: '#EF4444' },
    chat_message: { name: 'message-text', color: '#8B5CF6' },
    message_direct: { name: 'message-text', color: '#8B5CF6' },
    call_video: { name: 'video', color: '#EC4899' },
    call_audio: { name: 'phone', color: '#EC4899' },
    call_incoming: { name: 'phone-incoming', color: '#EC4899' },
    call_missed: { name: 'phone-missed', color: '#EF4444' },
    remedy_suggested: { name: 'leaf', color: '#10B981' },
    report_ready: { name: 'file-document', color: '#3B82F6' },
    live_event_started: { name: 'video-wireless', color: '#EF4444' },
    stream_started: { name: 'video-wireless', color: '#EF4444' },
    system_announcement: { name: 'bullhorn', color: '#3B82F6' },
    system_promotional: { name: 'gift', color: '#F59E0B' },
    force_logout: { name: 'logout', color: '#EF4444' },
    default: { name: 'bell', color: '#6B7280' },
  };
  
  return icons[type] || icons.default;
};

export default function UserNotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 20,
        unreadOnly: false,
      });

      if (response.success) {
        const newNotifications = response.data.notifications;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('❌ [Notifications] Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ [Notifications] Mark as read error:', error);
    }
  }, []);

  const handleNotificationPress = useCallback(async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    const { type, data } = notification;

    switch (type) {
      case 'order_created':
      case 'order_completed':
        if (data?.orderId) {
          navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
        break;

      case 'payment_success':
      case 'payment_failed':
      case 'wallet_recharged':
        navigation.navigate('Wallet');
        break;

      case 'chat_message':
      case 'message_direct':
        if (data?.chatId) {
          navigation.navigate('ChatScreen', { chatId: data.chatId });
        }
        break;

      case 'remedy_suggested':
      case 'report_ready':
        if (data?.orderId) {
          navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
        break;

      case 'live_event_started':
      case 'stream_started':
        if (data?.eventId) {
          navigation.navigate('LiveEvent', { eventId: data.eventId });
        }
        break;

      default:
        console.log('No specific action for type:', type);
    }
  }, [markAsRead, navigation]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  }, []);

  const clearAll = useCallback(async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAll();
              setNotifications([]);
              setUnreadCount(0);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      
      const notification = notifications.find(n => n.notificationId === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ [Notifications] Delete error:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  }, [notifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(1, false);
    setRefreshing(false);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1, true);
    }
  }, [loadingMore, hasMore, page, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const renderNotification = ({ item }) => {
    const iconData = getNotificationIcon(item.type);
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: `${iconData.color}15` }]}>
          <Icon name={iconData.name} size={22} color={iconData.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>

          <Text style={styles.time}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => deleteNotification(item.notificationId)}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#372643" />
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity onPress={clearAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="delete-sweep" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Mark All Read */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead} activeOpacity={0.7}>
          <Icon name="check-all" size={16} color="#372643" />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#372643']}
              tintColor="#372643"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="bell-off-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}