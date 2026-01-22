// src/screens/TabsScreen/StreamAnalyticsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { livestreamService } from '../../services/api/livestream.service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../style/StreamAnalyticsStyle';

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
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content" safeAreaTop={false}>
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
    </ScreenWrapper>
  );
}