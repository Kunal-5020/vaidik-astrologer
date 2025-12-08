// src/screens/TabsScreen/StreamAnalyticsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { livestreamService } from '../../services/api/livestream.service';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// Analytics Card Component
const AnalyticsCard = ({ icon, label, value, unit = '' }) => (
  <View style={styles.analyticsCard}>
    <View style={styles.cardIconContainer}>
      <Ionicons name={icon} size={24} color="#372643" />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>
        {value}
        <Text style={styles.cardUnit}> {unit}</Text>
      </Text>
    </View>
  </View>
);

// Header Component
const StreamHeader = ({ duration }) => (
  <View style={styles.headerSection}>
    <Text style={styles.headerTitle}>Stream Analytics</Text>
    <Text style={styles.headerSubtitle}>Session Summary Report</Text>
    <View style={styles.durationBadge}>
      <Ionicons name="time-outline" size={16} color="#372643" />
      <Text style={styles.durationText}>{duration} minutes</Text>
    </View>
  </View>
);

// Stats Grid
const StatsGrid = ({ totalViews, totalRevenue, totalCalls }) => (
  <View style={styles.gridContainer}>
    <AnalyticsCard
      icon="eye-outline"
      label="Total Views"
      value={totalViews.toLocaleString()}
    />
    <AnalyticsCard
      icon="wallet-outline"
      label="Revenue"
      value={`₹${totalRevenue.toLocaleString()}`}
    />
    <AnalyticsCard
      icon="call-outline"
      label="Paid Calls"
      value={totalCalls.toLocaleString()}
    />
  </View>
);

// Loading State
const LoadingState = () => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#372643" />
    <Text style={styles.loadingText}>Fetching analytics...</Text>
  </View>
);

// Error State
const ErrorState = ({ onRetry }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={48} color="#D4A017" />
    <Text style={styles.errorTitle}>Unable to Load Analytics</Text>
    <Text style={styles.errorMessage}>Please try again</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// Main Component
export default function StreamAnalyticsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { streamId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = () => {
    setLoading(true);
    setError(false);
    livestreamService
      .getStreamAnalytics(streamId)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Analytics Error:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleBackPress = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={fetchAnalytics} />;

  const duration = Math.floor((data?.duration || 0) / 60);
  const totalViews = data?.totalViews || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const totalCalls = data?.totalCalls || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StreamHeader duration={duration} />
        <StatsGrid
          totalViews={totalViews}
          totalRevenue={totalRevenue}
          totalCalls={totalCalls}
        />
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleBackPress}
          >
            <Ionicons name="home-outline" size={20} color="#372643" />
            <Text style={styles.actionButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Header
  headerSection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '500',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  durationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#372643',
    letterSpacing: 0.3,
  },

  // Grid
  gridContainer: {
    gap: 16,
    marginBottom: 32,
  },
  analyticsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#372643',
  },
  cardUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },

  // Actions
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    letterSpacing: 0.5,
  },

  // Loading & Error
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#372643',
    marginTop: 16,
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#372643',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
