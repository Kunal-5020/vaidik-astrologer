// src/screens/TabsScreen/EarningsReportScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { astrologerService } from '../../services/api/astrologer.service';

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

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('📊 [EarningsReport] Fetching data...');
      
      const [
        earningsResponse, 
        statsResponse, 
        transactionStatsResponse,
        giftStatsResponse
      ] = await Promise.all([
        astrologerService.getEarnings(),
        astrologerService.getStats(),
        astrologerService.getTransactionStats(),
        astrologerService.getGiftStats(),
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

      console.log('✅ [EarningsReport] Data loaded');
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
    <SafeAreaView style={styles.outerContainer} edges={['bottom', 'top']}>
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
                        onPress={() => {
                          setSelectedFilter(item);
                          setIsDropdownOpen(false);
                        }}
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

            {/* Pie Chart - Fixed Layout */}
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
    </SafeAreaView>
  );
};

export default EarningsReportScreen;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#372643',
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

  header: {
    backgroundColor: '#372643',
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: 48,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 999,
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#374151',
  },
  dropdownItemSelected: {
    color: '#372643',
    fontWeight: '700',
  },

  scrollContent: { 
    alignItems: 'center', 
    paddingBottom: 24,
  },

  topCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: screenWidth * 0.9,
    marginTop: 14,
    marginBottom: 6,
    gap: 10,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  topCardTitle: {
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    fontSize: 11,
  },
  topCardValue: {
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    width: screenWidth * 0.9,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 12,
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  serviceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  serviceSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  progressBarBG: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
