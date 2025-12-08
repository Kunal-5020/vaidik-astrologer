// src/screens/TabsScreen/StreamAnalyticsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { livestreamService } from '../../services';
import Toast from 'react-native-toast-message';

export default function StreamAnalyticsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { streamId } = route.params;

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await livestreamService.getStreamAnalytics(streamId);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load analytics',
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (!analytics) return;

    try {
      const message = `
🎥 Stream Analytics

📊 Duration: ${formatDuration(analytics?.duration)}
👥 Peak Viewers: ${analytics?.peakViewers || 0}
👁️ Total Views: ${analytics?.totalViews || 0}
💰 Revenue: ₹${analytics?.totalRevenue || 0}
📞 Calls: ${analytics?.totalCalls || 0}

Stream on VaidikTalk!
      `.trim();

      await Share.share({ message });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stream Analytics</Text>
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
          <Icon name="share" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={44} color="#10b981" />
          <Text style={styles.successTitle}>Stream Completed!</Text>
          <Text style={styles.successSubtitle} numberOfLines={2}>
            {analytics?.stream?.title}
          </Text>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="access-time" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{formatDuration(analytics?.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="visibility" size={28} color="#3B82F6" />
            <Text style={styles.statValue}>{analytics?.totalViews || 0}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="people" size={28} color="#8B5CF6" />
            <Text style={styles.statValue}>{analytics?.peakViewers || 0}</Text>
            <Text style={styles.statLabel}>Peak Viewers</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="attach-money" size={28} color="#10B981" />
            <Text style={styles.statValue}>₹{analytics?.totalRevenue || 0}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* Engagement Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement</Text>

          <View style={styles.engagementRow}>
            <Icon name="chat" size={20} color="#6B7280" />
            <Text style={styles.engagementLabel}>Comments</Text>
            <Text style={styles.engagementValue}>{analytics?.totalComments || 0}</Text>
          </View>

          <View style={styles.engagementRow}>
            <Icon name="favorite" size={20} color="#EF4444" />
            <Text style={styles.engagementLabel}>Likes</Text>
            <Text style={styles.engagementValue}>{analytics?.totalLikes || 0}</Text>
          </View>

          <View style={styles.engagementRow}>
            <Icon name="card-giftcard" size={20} color="#F59E0B" />
            <Text style={styles.engagementLabel}>Gifts</Text>
            <Text style={styles.engagementValue}>{analytics?.totalGifts || 0}</Text>
          </View>

          <View style={styles.engagementRow}>
            <Icon name="phone" size={20} color="#10B981" />
            <Text style={styles.engagementLabel}>Calls</Text>
            <Text style={styles.engagementValue}>{analytics?.totalCalls || 0}</Text>
          </View>
        </View>

        {/* Revenue Breakdown */}
        {analytics?.revenueBreakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Breakdown</Text>

            {analytics.revenueBreakdown.entry > 0 && (
              <View style={styles.revenueRow}>
                <Text style={styles.revenueLabel}>Entry Fees</Text>
                <Text style={styles.revenueValue}>
                  ₹{analytics.revenueBreakdown.entry}
                </Text>
              </View>
            )}

            {analytics.revenueBreakdown.gifts > 0 && (
              <View style={styles.revenueRow}>
                <Text style={styles.revenueLabel}>Gifts</Text>
                <Text style={styles.revenueValue}>
                  ₹{analytics.revenueBreakdown.gifts}
                </Text>
              </View>
            )}

            {analytics.revenueBreakdown.calls > 0 && (
              <View style={styles.revenueRow}>
                <Text style={styles.revenueLabel}>Calls</Text>
                <Text style={styles.revenueValue}>
                  ₹{analytics.revenueBreakdown.calls}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MyStreams')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>View All Streams</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  successBanner: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  engagementLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    marginLeft: 12,
  },
  engagementValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  revenueLabel: {
    fontSize: 13,
    color: '#374151',
  },
  revenueValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewerRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  viewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  viewerTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  viewerAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});
