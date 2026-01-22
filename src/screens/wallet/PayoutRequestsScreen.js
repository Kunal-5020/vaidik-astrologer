// src/screens/main_screens/PayoutRequestsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';
import { styles } from '../../style/PayoutRequestsStyle';

const PayoutRequestsScreen = ({ navigation }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayouts(1, false);
  }, [filter]);

  const fetchPayouts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await payoutService.getPayouts({
        page: pageNum,
        limit: 20,
        status: filter !== 'all' ? filter : undefined,
      });

      if (response.success) {
        const newPayouts = response.data.payouts;

        if (append) {
          setPayouts(prev => [...prev, ...newPayouts]);
        } else {
          setPayouts(newPayouts);
        }

        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('❌ [PayoutRequests] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPayouts(1, false);
    setRefreshing(false);
  }, [fetchPayouts]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPayouts(page + 1, true);
    }
  }, [hasMore, loading, page, fetchPayouts]);

  const renderItem = ({ item }) => {
    const statusColor = payoutService.getPayoutStatusColor(item.status);
    const statusLabel = payoutService.getPayoutStatusLabel(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PayoutDetails', { payoutId: item.payoutId })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.amount}>{payoutService.formatAmount(item.amount)}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={14} color="#666" />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="bank" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.bankDetails?.bankName || 'Bank Account'}
            </Text>
          </View>

          {item.bankDetails?.accountNumber && (
            <View style={styles.infoRow}>
              <Icon name="numeric" size={14} color="#666" />
              <Text style={styles.infoText}>
                **** {item.bankDetails.accountNumber.slice(-4)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.payoutId} numberOfLines={1}>ID: {item.payoutId}</Text>
          <Icon name="chevron-right" size={18} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      {['all', 'pending', 'completed', 'rejected'].map(status => (
        <TouchableOpacity
          key={status}
          style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
          onPress={() => setFilter(status)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false}>
      {loading && payouts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={payouts}
          keyExtractor={(item) => item.payoutId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-off-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>No payout requests found</Text>
              <Text style={styles.emptySubtext}>Your withdrawal history will appear here</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#372643']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
};

export default PayoutRequestsScreen;
