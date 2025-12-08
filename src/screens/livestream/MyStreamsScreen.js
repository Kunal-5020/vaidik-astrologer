// src/screens/TabsScreen/MyStreamsScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { livestreamService } from '../../services';
import Toast from 'react-native-toast-message';

export default function MyStreamsScreen() {
  const navigation = useNavigation();

  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // all, live, ended, scheduled

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchStreams(1, true);
    }, [filter])
  );

  const fetchStreams = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      }

      const params = {
        page: pageNum,
        limit: 10,
        status: filter !== 'all' ? filter : undefined,
      };

      console.log('📤 Fetching my streams:', params);
      const response = await livestreamService.getMyStreams(params);
      console.log('✅ Streams fetched:', response.data);

      if (response.success) {
        const newStreams = response.data || [];

        if (refresh || pageNum === 1) {
          setStreams(newStreams);
        } else {
          setStreams(prev => [...prev, ...newStreams]);
        }

        setHasMore(response.data.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('❌ Fetch streams failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load streams',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStreams(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchStreams(page + 1);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return { bg: '#ef4444', text: '🔴 LIVE', color: '#fff' };
      case 'scheduled':
        return { bg: '#3b82f6', text: 'SCHEDULED', color: '#fff' };
      case 'ended':
        return { bg: '#6B7280', text: 'ENDED', color: '#fff' };
      case 'cancelled':
        return { bg: '#f59e0b', text: 'CANCELLED', color: '#fff' };
      default:
        return { bg: '#E5E7EB', text: status.toUpperCase(), color: '#111827' };
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStreamItem = ({ item }) => {
    const badge = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.streamCard}
        activeOpacity={0.8}
        onPress={() => {
          if (item.status === 'live') {
            navigation.navigate('Go-Live', { streamId: item.streamId });
          } else if (item.status === 'ended') {
            navigation.navigate('StreamAnalytics', { streamId: item.streamId });
          } else {
            Alert.alert(
              'Stream Details',
              `Title: ${item.title}\nStatus: ${item.status}\nCreated: ${formatDate(item.createdAt)}`,
              [{ text: 'OK' }]
            );
          }
        }}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
        </View>

        {/* Stream Info */}
        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {item.description && (
            <Text style={styles.streamDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}

          <View style={styles.streamMeta}>
            {/* Date */}
            <View style={styles.metaItem}>
              <Icon name="calendar-today" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {formatDate(item.startedAt || item.createdAt)}
              </Text>
            </View>

            {/* Duration (for ended streams) */}
            {item.status === 'ended' && item.duration > 0 && (
              <View style={styles.metaItem}>
                <Icon name="access-time" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.streamStats}>
          <View style={styles.statItem}>
            <Icon name="visibility" size={18} color="#6B7280" />
            <Text style={styles.statValue}>{item.totalViews || 0}</Text>
          </View>

          {item.status === 'live' && (
            <View style={styles.statItem}>
              <Icon name="people" size={18} color="#ef4444" />
              <Text style={styles.statValue}>{item.viewerCount || 0}</Text>
            </View>
          )}

          <View style={styles.statItem}>
            <Icon name="attach-money" size={18} color="#10b981" />
            <Text style={styles.statValue}>₹{item.totalRevenue || 0}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.streamActions}>
          {item.status === 'live' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Go-Live', { streamId: item.streamId })}
              activeOpacity={0.8}
            >
              <Icon name="play-arrow" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Go Live</Text>
            </TouchableOpacity>
          )}

          {item.status === 'ended' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('StreamAnalytics', { streamId: item.streamId })}
              activeOpacity={0.8}
            >
              <Icon name="bar-chart" size={20} color="#372643" />
              <Text style={styles.secondaryActionText}>Analytics</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="video-library" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No streams yet</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all'
          ? 'Start your first livestream to connect with viewers'
          : `No ${filter} streams found`}
      </Text>
      <TouchableOpacity
        style={styles.goLiveButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Text style={styles.goLiveButtonText}>Go Live Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Streams</Text>
          <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7}>
            <Icon name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {['all', 'live', 'ended', 'scheduled'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => {
                setFilter(f);
                setPage(1);
                setStreams([]);
                setIsLoading(true);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === f && styles.filterTabTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Streams List */}
        {isLoading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#372643" />
          </View>
        ) : (
          <FlatList
            data={streams}
            renderItem={renderStreamItem}
            keyExtractor={(item) => item._id || item.streamId}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#372643']}
                tintColor="#372643"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={
              isLoading && page > 1 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#372643" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#372643',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  streamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  streamInfo: {
    marginBottom: 10,
  },
  streamTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  streamDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  streamMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  streamStats: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  streamActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  secondaryAction: {
    backgroundColor: '#EDE9FE',
  },
  secondaryActionText: {
    color: '#372643',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  goLiveButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
