import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import astrologerOrderService from '../../services/api/astrologer-order.service';

const TABS = ['All', 'Chats', 'Calls', 'Active'];

const AstrologerOrdersScreen = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  // ✅ FIXED: useCallback with async function called inside sync callback
  const fetchData = useCallback(() => {
    // Call async function immediately inside sync callback
    const loadData = async () => {
      try {
        setLoading(true);
        
        // ✅ Fetch BOTH orders AND sessions in parallel
        const [orderRes, sessionRes] = await Promise.all([
          astrologerOrderService.getAstrologerOrders({ page: 1, limit: 50 }),
          astrologerOrderService.getAstrologerSessions({ page: 1, limit: 50 }),
        ]);

        // ✅ Process Orders (conversation threads)
        let allSessions = [];
        if (orderRes.success && orderRes.orders?.length > 0) {
          const normalizedOrders = orderRes.orders.map((order) => ({
            id: order.orderId,
            orderId: order.orderId,
            type: 'conversation',
            status: order.status,
            startedAt: order.createdAt,
            endedAt: order.lastInteractionAt || order.lastSessionEndTime,
            durationSeconds: order.totalUsedDurationSeconds || 0,
            amount: order.totalAmount || 0,
            user: {
              id: order.userId?._id || order.userId,
              name: order.userId?.name || 'User',
              avatar: order.userId?.profileImage || order.userId?.profilePicture,
              phoneNumber: order.userId?.phoneNumber,
            },
            lastPreview: `${order.totalSessions || 0} sessions`,
            lastInteractionAt: order.lastInteractionAt || order.createdAt,
            raw: order,
          }));
          allSessions.push(...normalizedOrders);
        }

        // ✅ Process Sessions (chat + call)
        if (sessionRes.success && sessionRes.data?.sessions?.length > 0) {
          allSessions.push(...sessionRes.data.sessions);
        }

        // ✅ Sort by most recent
        allSessions.sort((a, b) => {
          const t1 = new Date(a.lastInteractionAt || a.startedAt || 0).getTime();
          const t2 = new Date(b.lastInteractionAt || b.startedAt || 0).getTime();
          return t2 - t1;
        });

        const earned = allSessions.reduce((sum, s) => sum + (s.amount || 0), 0);

        setSessions(allSessions);
        setOrders(orderRes.orders || []);
        setTotalEarned(earned);

      } catch (error) {
        console.error('❌ [AstroOrders] Fetch data error:', error);
        setSessions([]);
        setOrders([]);
        setTotalEarned(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // ✅ Empty deps = run on focus

  // ✅ FIXED: useFocusEffect now receives sync callback (no async Promise returned)
  useFocusEffect(fetchData);

  const filteredData = sessions.filter((s) => {
    if (selectedTab === 'All') return true;
    if (selectedTab === 'Chats') return s.type === 'chat';
    if (selectedTab === 'Calls') return s.type === 'call';
    if (selectedTab === 'Active') {
      const activeStatuses = ['active', 'initiated', 'waiting', 'waitinginqueue'];
      return activeStatuses.includes(s.status);
    }
    return true;
  });

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} • ${time}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const formatAmount = (value) => {
    if (!value || value === 0) return '₹0';
    return `₹${Number(value).toFixed(0)}`;
  };

const handleOpenDetail = (item) => {
  console.log('Opening detail for item:', item);

  // ✅ 1. VALIDATION CHECK
  // Check if item exists AND if orderId exists
  if (!item || !item.orderId) {
    console.warn('❌ Cannot open detail: Missing Order ID', item);
    Alert.alert("Error", "Cannot open details. Order ID is missing.");
    return; // Stop execution here
  }

  // ✅ 2. NAVIGATION
  if (item.type === 'chat' || item.type === 'conversation') {
    navigation.navigate('AstroHistoryChat', {
      orderId: item.orderId,
    });
  } else {
    // Note: If you have a different screen for Calls, change this route name
    navigation.navigate('AstroHistoryChat', {
      orderId: item.orderId,
    });
  }
};

  const renderItem = ({ item }) => {
    const isChat = item.type === 'chat' || item.type === 'conversation';
    const isActive = ['active', 'initiated', 'waiting', 'waitinginqueue'].includes(item.status || '');

    const iconName = isChat ? 'chatbubble' : 'call';
    const iconColor = isChat ? '#2196F3' : '#4CAF50';
    const bgColor = isChat ? '#E3F2FD' : '#E8F5E9';

    const userLetter = item.user?.name?.charAt(0)?.toUpperCase() || 'U';

    return (
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.8}
        onPress={() => handleOpenDetail(item)}
      >
        {/* Left icon bubble with user initial */}
        <View style={styles.iconWrapper}>
          <View style={styles.userBubble}>
            <Text style={styles.userInitial}>{userLetter}</Text>
          </View>
          <View style={[styles.typeIconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={iconName} size={14} color={iconColor} />
          </View>
        </View>

        {/* Middle content */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.user?.name || 'User'}
            </Text>
            <Text style={styles.itemDate} numberOfLines={1}>
              {formatDateTime(item.lastInteractionAt || item.endedAt || item.startedAt)}
            </Text>
          </View>

          <Text style={styles.itemMeta} numberOfLines={1}>
            {item.lastPreview || (item.type === 'conversation' ? 'Consultation thread' : 'Session')}
          </Text>

          <Text style={styles.itemSubMeta} numberOfLines={1}>
            {item.type === 'conversation' 
              ? `${item.raw?.totalSessions || 0} sessions • Total: ${formatAmount(item.amount)}`
              : `Duration: ${formatDuration(item.durationSeconds)} • Earned: ${formatAmount(item.amount)}`
            }
          </Text>
        </View>

        {/* Right status */}
        <View style={styles.itemRight}>
          <View style={[styles.statusBadge, isActive ? styles.badgeActive : styles.badgeCompleted]}>
            <Text style={[styles.statusText, isActive ? styles.textActive : styles.textCompleted]}>
              {isActive ? 'Active' : 'Completed'}
            </Text>
          </View>
          <Text style={styles.viewText}>View</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const tabCounts = {
    All: sessions.length,
    Chats: sessions.filter(s => s.type === 'chat').length,
    Calls: sessions.filter(s => s.type === 'call').length,
    Active: sessions.filter(s => ['active', 'initiated', 'waiting', 'waitinginqueue'].includes(s.status || '')).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#5A2CCF" barStyle="light-content" />
      
      {/* Purple header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Sessions ({sessions.length})</Text>
          <View style={styles.earnedBox}>
            <Text style={styles.earnedLabel}>Total Earned</Text>
            <Text style={styles.earnedValue}>{formatAmount(totalEarned)}</Text>
          </View>
        </View>

        {/* Tabs with counts */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                selectedTab === tab && styles.tabBtnActive,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab} {tab !== 'All' && `(${tabCounts[tab]})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5A2CCF" />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            filteredData.length === 0
              ? [styles.listContent, styles.center]
              : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="hourglass-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>
                No {selectedTab.toLowerCase()} sessions found
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedTab === 'All' 
                  ? 'Start your first consultation to see sessions here'
                  : `Check other tabs for ${selectedTab.toLowerCase()} sessions`
                }
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ✅ Styles unchanged (same as your original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#666', 
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    backgroundColor: '#5A2CCF',
    padding: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  earnedBox: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  earnedLabel: {
    fontSize: 10,
    color: '#EDE7F6',
  },
  earnedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
  },
  tabText: { 
    color: '#E0E0E0', 
    fontWeight: '600', 
    fontSize: 13,
  },
  tabTextActive: { 
    color: '#5A2CCF', 
    fontWeight: '700' 
  },
  listContent: { padding: 16 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 12,
  },
  userBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
  },
  typeIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: { flex: 1 },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#333', 
    flex: 1 
  },
  itemDate: {
    fontSize: 11,
    color: '#888',
    marginLeft: 8,
  },
  itemMeta: {
    fontSize: 12,
    color: '#555',
  },
  itemSubMeta: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeCompleted: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: '#2E7D32' },
  textCompleted: { color: '#757575' },
  viewText: {
    fontSize: 11,
    color: '#5A2CCF',
    fontWeight: '600',
  },
});

export default AstrologerOrdersScreen;
