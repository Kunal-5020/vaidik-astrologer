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

  const handleShare = async () => {
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

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB300" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stream Analytics</Text>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Icon name="check-circle" size={48} color="#10b981" />
          <Text style={styles.successTitle}>Stream Completed!</Text>
          <Text style={styles.successSubtitle}>{analytics?.stream?.title}</Text>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="access-time" size={32} color="#FFB300" />
            <Text style={styles.statValue}>{formatDuration(analytics?.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="visibility" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{analytics?.totalViews || 0}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="people" size={32} color="#8b5cf6" />
            <Text style={styles.statValue}>{analytics?.peakViewers || 0}</Text>
            <Text style={styles.statLabel}>Peak Viewers</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="attach-money" size={32} color="#10b981" />
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
            <Icon name="favorite" size={20} color="#ef4444" />
            <Text style={styles.engagementLabel}>Likes</Text>
            <Text style={styles.engagementValue}>{analytics?.totalLikes || 0}</Text>
          </View>

          <View style={styles.engagementRow}>
            <Icon name="card-giftcard" size={20} color="#FFB300" />
            <Text style={styles.engagementLabel}>Gifts</Text>
            <Text style={styles.engagementValue}>{analytics?.totalGifts || 0}</Text>
          </View>

          <View style={styles.engagementRow}>
            <Icon name="phone" size={20} color="#10b981" />
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
                <Text style={styles.revenueValue}>₹{analytics.revenueBreakdown.entry}</Text>
              </View>
            )}

            {analytics.revenueBreakdown.gifts > 0 && (
              <View style={styles.revenueRow}>
                <Text style={styles.revenueLabel}>Gifts</Text>
                <Text style={styles.revenueValue}>₹{analytics.revenueBreakdown.gifts}</Text>
              </View>
            )}

            {analytics.revenueBreakdown.calls > 0 && (
              <View style={styles.revenueRow}>
                <Text style={styles.revenueLabel}>Calls</Text>
                <Text style={styles.revenueValue}>₹{analytics.revenueBreakdown.calls}</Text>
              </View>
            )}
          </View>
        )}

        {/* Top Viewers */}
        {analytics?.topViewers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Viewers</Text>
            
            {analytics.topViewers.slice(0, 5).map((viewer, index) => (
              <View key={viewer._id} style={styles.viewerRow}>
                <View style={styles.viewerRank}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.viewerInfo}>
                  <Text style={styles.viewerName}>{viewer.userName}</Text>
                  <Text style={styles.viewerTime}>
                    {Math.floor(viewer.duration / 60)} min watched
                  </Text>
                </View>
                <Text style={styles.viewerAmount}>₹{viewer.spent || 0}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MyStreams')}
          >
            <Text style={styles.secondaryButtonText}>View All Streams</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  content: {
    flex: 1,
  },
  successBanner: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  engagementLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  engagementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#374151',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  viewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  viewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  viewerTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewerAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
