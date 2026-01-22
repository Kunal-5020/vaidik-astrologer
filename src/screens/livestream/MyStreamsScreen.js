// src/screens/TabsScreen/MyStreamsScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { livestreamService } from '../../services';
import Toast from 'react-native-toast-message';
import { styles } from '../../style/MyStreamsStyle';

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
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
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
    </ScreenWrapper>
  );
}
