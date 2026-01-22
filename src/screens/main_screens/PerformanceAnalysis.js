// src/screens/TabsScreen/PerformanceAnalysis.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { astrologerService } from '../../services/api/astrologer.service';
import { styles } from '../../style/PerformanceAnalysisStyle';

const PerformanceCard = ({ icon, iconColor, title, value, subtitle }) => (
  <View style={styles.perfCard}>
    <View style={[styles.perfIconBox, { backgroundColor: `${iconColor}15` }]}>
      <Icon name={icon} size={24} color={iconColor} />
    </View>
    <View style={styles.perfContent}>
      <Text style={styles.perfTitle}>{title}</Text>
      <Text style={[styles.perfValue, { color: iconColor }]}>{value}</Text>
      {subtitle && <Text style={styles.perfSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

const MetricRow = ({ label, value, total, color }) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricRight}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricPercentage}>{percentage}%</Text>
      </View>
    </View>
  );
};

export default function PerformanceAnalysis() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 [Performance] Fetching data...');
      
      const [statsResponse, earningsResponse] = await Promise.all([
        astrologerService.getStats(),
        astrologerService.getEarnings(),
      ]);
      
      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }
      
      if (earningsResponse?.success) {
        setEarnings(earningsResponse.data);
      }
      
      console.log('✅ [Performance] Data loaded');
    } catch (error) {
      console.error('❌ [Performance] Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const totalOrders = stats?.totalOrders || 0;
  const callOrders = stats?.callOrders || 0;
  const chatOrders = stats?.chatOrders || 0;
  const streamOrders = stats?.streamOrders || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const repeatCustomers = stats?.repeatCustomers || 0;

  const totalEarned = earnings?.totalEarned || 0;
  const netEarnings = earnings?.netEarnings || 0;
  const platformCommission = earnings?.platformCommission || 0;
  const totalPenalties = earnings?.totalPenalties || 0;

  const avgOrderDuration = totalOrders > 0 ? Math.round(totalMinutes / totalOrders) : 0;
  const revenuePerOrder = totalOrders > 0 ? Math.round(totalEarned / totalOrders) : 0;
  const repeatRate = totalOrders > 0 ? ((repeatCustomers / totalOrders) * 100).toFixed(1) : 0;

  const services = [
    { name: 'Call Orders', value: callOrders, color: '#3B82F6' },
    { name: 'Chat Orders', value: chatOrders, color: '#10B981' },
    { name: 'Stream Orders', value: streamOrders, color: '#F59E0B' },
  ].filter(s => s.value > 0);

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false}>
      <ScrollView
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
        {loading && !stats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#372643" />
            <Text style={styles.loadingText}>Loading performance data...</Text>
          </View>
        ) : (
          <>
            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              
              <PerformanceCard
                icon="trophy"
                iconColor="#F59E0B"
                title="Total Orders"
                value={totalOrders}
                subtitle="All consultations"
              />

              <PerformanceCard
                icon="cash"
                iconColor="#10B981"
                title="Total Revenue"
                value={`₹${totalEarned.toLocaleString('en-IN')}`}
                subtitle={`Net: ₹${netEarnings.toLocaleString('en-IN')}`}
              />

              <PerformanceCard
                icon="trending-up"
                iconColor="#372643"
                title="Revenue per Order"
                value={`₹${revenuePerOrder}`}
                subtitle="Average earnings"
              />

              <PerformanceCard
                icon="time"
                iconColor="#3B82F6"
                title="Avg Session Time"
                value={`${avgOrderDuration} min`}
                subtitle={`Total: ${totalMinutes} minutes`}
              />
            </View>

            {/* Service Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Distribution</Text>
              <View style={styles.card}>
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <MetricRow
                      key={index}
                      label={service.name}
                      value={service.value}
                      total={totalOrders}
                      color={service.color}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="bar-chart-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No service data yet</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Customer Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Insights</Text>
              
              <View style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <View style={styles.insightItem}>
                    <Icon name="people" size={28} color="#372643" />
                    <Text style={styles.insightValue}>{repeatCustomers}</Text>
                    <Text style={styles.insightLabel}>Repeat Customers</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.insightItem}>
                    <Icon name="heart" size={28} color="#EF4444" />
                    <Text style={styles.insightValue}>{repeatRate}%</Text>
                    <Text style={styles.insightLabel}>Retention Rate</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Financial Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Breakdown</Text>
              
              <View style={styles.card}>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Gross Revenue</Text>
                  <Text style={[styles.financialValue, { color: '#10B981' }]}>
                    ₹{totalEarned.toLocaleString('en-IN')}
                  </Text>
                </View>
                
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Platform Fee (40%)</Text>
                  <Text style={[styles.financialValue, { color: '#EF4444' }]}>
                    - ₹{platformCommission.toLocaleString('en-IN')}
                  </Text>
                </View>

                {totalPenalties > 0 && (
                  <View style={styles.financialRow}>
                    <View style={styles.penaltyLabelRow}>
                      <Text style={styles.financialLabel}>Penalties</Text>
                      <Icon name="alert-circle" size={14} color="#F59E0B" style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[styles.financialValue, { color: '#F59E0B' }]}>
                      - ₹{totalPenalties.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
                
                <View style={[styles.financialRow, styles.financialTotal]}>
                  <Text style={[styles.financialLabel, { fontWeight: 'bold' }]}>Net Earnings</Text>
                  <Text style={[styles.financialValue, { fontWeight: 'bold', color: '#372643' }]}>
                    ₹{netEarnings.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Icon name="information-circle" size={16} color="#372643" />
                <Text style={styles.infoText}>
                  Platform fee is 40% of gross revenue. Net earnings = Gross - Platform Fee - Penalties.
                </Text>
              </View>
            </View>

            {/* Performance Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Summary</Text>
              
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Icon name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.summaryText}>
                    Completed <Text style={styles.summaryBold}>{totalOrders}</Text> consultations
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Icon name="time" size={18} color="#3B82F6" />
                  <Text style={styles.summaryText}>
                    Spent <Text style={styles.summaryBold}>{totalMinutes} minutes</Text> helping clients
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Icon name="trending-up" size={18} color="#372643" />
                  <Text style={styles.summaryText}>
                    Average <Text style={styles.summaryBold}>₹{revenuePerOrder}</Text> per consultation
                  </Text>
                </View>
                
                {repeatCustomers > 0 && (
                  <View style={styles.summaryRow}>
                    <Icon name="people" size={18} color="#372643" />
                    <Text style={styles.summaryText}>
                      <Text style={styles.summaryBold}>{repeatCustomers}</Text> clients came back
                    </Text>
                  </View>
                )}

                {totalPenalties > 0 && (
                  <View style={styles.summaryRow}>
                    <Icon name="alert-circle" size={18} color="#F59E0B" />
                    <Text style={styles.summaryText}>
                      Total penalties: <Text style={styles.summaryBold}>₹{totalPenalties}</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
