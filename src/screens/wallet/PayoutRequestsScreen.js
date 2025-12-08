// src/screens/main_screens/PayoutRequestsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 40,
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#666',
  },

  listContent: { 
    padding: 16,
    paddingBottom: 24,
  },

  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterBtnActive: {
    backgroundColor: '#372643',
    borderColor: '#372643',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },

  cardBody: {
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  payoutId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    flex: 1,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: { 
    color: '#6B7280', 
    fontSize: 16, 
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PayoutRequestsScreen;
