// src/screens/TabsScreen/EarningsReportScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { astrologerService } from '../../services/api/astrologer.service';
import { styles } from '../../style/EarningStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

const { width: screenWidth } = Dimensions.get('window');

const EarningsReportScreen = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  const [earnings, setEarnings] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);
  const [giftStats, setGiftStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownOptions = [
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Last 90 Days',
  ];

  // Convert filter text to days
  const getDaysFromFilter = (filter) => {
    const daysMap = {
      'Last 7 Days': 7,
      'Last 15 Days': 15,
      'Last 30 Days': 30,
      'Last 90 Days': 90,
    };
    return daysMap[filter] || 30;
  };

  // Calculate date range based on selected filter
  const getDateRange = useCallback(() => {
    const days = getDaysFromFilter(selectedFilter);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      endDate: endDate.toISOString().split('T')[0],
      days,
    };
  }, [selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [selectedFilter]) // Re-fetch when filter changes
  );

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('📊 [EarningsReport] Fetching data...');
      
      const dateRange = getDateRange();
      console.log('📅 Date Range:', dateRange);
      
      // Option 1: If your API supports date range parameters
      const [
        earningsResponse, 
        statsResponse, 
        transactionStatsResponse,
        giftStatsResponse
      ] = await Promise.all([
        astrologerService.getEarnings(dateRange),
        astrologerService.getStats(dateRange),
        astrologerService.getTransactionStats(dateRange),
        astrologerService.getGiftStats(dateRange),
      ]);
      
      if (earningsResponse?.success) {
        setEarnings(earningsResponse.data);
      }
      
      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }

      if (transactionStatsResponse?.success) {
        setTransactionStats(transactionStatsResponse.data);
      }

      if (giftStatsResponse?.success) {
        setGiftStats(giftStatsResponse.data);
      }

      console.log('✅ [EarningsReport] Data loaded for', selectedFilter);
    } catch (error) {
      console.error('❌ [EarningsReport] Error:', error);
      Alert.alert('Error', error.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Handle filter selection
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
    // Data will be fetched automatically via useFocusEffect dependency
  };

  const hasData = !!(earnings || stats);
  
  const sessionPaymentData = transactionStats?.byType?.session_payment || {};
  const giftData = transactionStats?.byType?.gift || {};
  
  const totalEarned = earnings?.totalEarned || 0;
  const netEarnings = earnings?.netEarnings || 0;
  const withdrawableAmount = earnings?.withdrawableAmount || 0;
  const totalWithdrawn = earnings?.totalWithdrawn || 0;
  const pendingWithdrawal = earnings?.pendingWithdrawal || 0;
  const platformCommission = earnings?.platformCommission || 0;
  const totalPenalties = earnings?.totalPenalties || 0;

  const totalOrders = stats?.totalOrders || 0;
  const callOrders = stats?.callOrders || 0;
  const chatOrders = stats?.chatOrders || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const repeatCustomers = stats?.repeatCustomers || 0;

  const audioCallData = transactionStats?.bySessionType?.audio_call || {};
  const videoCallData = transactionStats?.bySessionType?.video_call || {};
  const chatData = transactionStats?.bySessionType?.chat || {};
  const streamData = transactionStats?.bySessionType?.stream_call || {};

  const callRevenue = (audioCallData.totalAmount || 0) + (videoCallData.totalAmount || 0);
  const chatRevenue = chatData.totalAmount || 0;
  const streamRevenue = streamData.totalAmount || 0;
  const giftRevenue = giftData.totalAmount || 0;

  const totalGifts = giftStats?.totalGifts || 0;
  const totalGiftEarned = giftStats?.totalEarned || 0;
  const directGifts = giftStats?.directGifts?.count || 0;
  const streamGifts = giftStats?.streamGifts?.count || 0;

  const getPercentage = (value) => {
    if (totalEarned === 0) return 0;
    return Number(((value / totalEarned) * 100).toFixed(1));
  };

  const pieData = [
    { name: 'Chat', population: chatRevenue, color: '#10B981', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Call', population: callRevenue, color: '#3B82F6', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Stream', population: streamRevenue, color: '#F59E0B', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Gifts', population: giftRevenue, color: '#8B5CF6', legendFontColor: '#333', legendFontSize: 12 },
  ].filter(item => item.population > 0);

  const serviceData = [
    { id: 1, title: 'Chat Sessions', percentage: getPercentage(chatRevenue), count: `${chatOrders} / ${totalOrders}`, revenue: chatRevenue, color: '#10B981' },
    { id: 2, title: 'Call Sessions', percentage: getPercentage(callRevenue), count: `${callOrders} / ${totalOrders}`, revenue: callRevenue, color: '#3B82F6' },
    { id: 3, title: 'Live Stream', percentage: getPercentage(streamRevenue), count: `0 / ${totalOrders}`, revenue: streamRevenue, color: '#F59E0B' },
    { id: 4, title: 'Gifts Received', percentage: getPercentage(giftRevenue), count: `${totalGifts} gifts`, revenue: giftRevenue, color: '#8B5CF6' },
  ];

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      {loading && !hasData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Earnings Report</Text>

            <View style={styles.filterRow}>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownText}>{selectedFilter}</Text>
                  <Icon
                    name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {dropdownOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleFilterChange(item)}
                        style={styles.dropdownItem}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            item === selectedFilter && styles.dropdownItemSelected,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#372643']}
                tintColor="#372643"
              />
            }
          >
            {/* Summary Cards */}
            <View style={styles.topCardsRow}>
              <View style={styles.topCard}>
                <Icon name="clipboard-check" size={30} color="#372643" />
                <Text style={styles.topCardTitle}>Total Orders</Text>
                <Text style={styles.topCardValue}>{totalOrders}</Text>
              </View>
              <View style={styles.topCard}>
                <Icon name="cash-multiple" size={30} color="#10B981" />
                <Text style={styles.topCardTitle}>Total Earnings</Text>
                <Text style={styles.topCardValue}>₹{totalEarned.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.topCardsRow}>
              <View style={styles.topCard}>
                <Icon name="wallet" size={30} color="#3B82F6" />
                <Text style={styles.topCardTitle}>Withdrawable</Text>
                <Text style={styles.topCardValue}>₹{withdrawableAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.topCard}>
                <Icon name="gift" size={30} color="#8B5CF6" />
                <Text style={styles.topCardTitle}>Gifts</Text>
                <Text style={styles.topCardValue}>₹{totalGiftEarned.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Pie Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Earnings Breakdown</Text>
              {totalEarned > 0 && pieData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieData}
                    width={screenWidth * 0.9}
                    height={200}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    center={[10, 0]}
                    absolute
                    hasLegend={true}
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="chart-pie" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No earnings data yet</Text>
                  <Text style={styles.emptySubtext}>Complete your first session</Text>
                </View>
              )}
            </View>

            {/* Revenue Distribution */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Revenue Distribution</Text>
              {totalOrders > 0 || totalGifts > 0 ? (
                serviceData.map(item => (
                  <View key={item.id} style={styles.serviceCard}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.serviceTitle, { color: item.color }]}>
                        {item.title}
                      </Text>
                      <Text style={styles.serviceValue}>{item.percentage}%</Text>
                    </View>
                    <View style={styles.progressBarBG}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${item.percentage || 0}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.serviceSubtitle}>
                        ₹{Math.round(item.revenue).toLocaleString()}
                      </Text>
                      <Text style={styles.serviceSubtitle}>{item.count}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="chart-bar" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No revenue data</Text>
                </View>
              )}
            </View>

            {/* Gift Stats */}
            {totalGifts > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Gift Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Icon name="gift-outline" size={22} color="#8B5CF6" />
                    <Text style={styles.statValue}>{totalGifts}</Text>
                    <Text style={styles.statLabel}>Total Gifts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="cash" size={22} color="#10B981" />
                    <Text style={styles.statValue}>₹{totalGiftEarned}</Text>
                    <Text style={styles.statLabel}>Gift Earnings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="account-heart" size={22} color="#EF4444" />
                    <Text style={styles.statValue}>{directGifts}</Text>
                    <Text style={styles.statLabel}>Direct Gifts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="video" size={22} color="#3B82F6" />
                    <Text style={styles.statValue}>{streamGifts}</Text>
                    <Text style={styles.statLabel}>Stream Gifts</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Additional Insights */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Additional Insights</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="clock-outline" size={22} color="#3B82F6" />
                  <Text style={styles.statValue}>{totalMinutes}</Text>
                  <Text style={styles.statLabel}>Total Minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="account-multiple" size={22} color="#10B981" />
                  <Text style={styles.statValue}>{repeatCustomers}</Text>
                  <Text style={styles.statLabel}>Repeat Clients</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="minus-circle" size={22} color="#EF4444" />
                  <Text style={styles.statValue}>₹{totalPenalties}</Text>
                  <Text style={styles.statLabel}>Penalties</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="percent" size={22} color="#F59E0B" />
                  <Text style={styles.statValue}>{earnings?.platformCommissionRate || 40}%</Text>
                  <Text style={styles.statLabel}>Commission</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </>
      )}
    </ScreenWrapper>
  );
};

export default EarningsReportScreen;
