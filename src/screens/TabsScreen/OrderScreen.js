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
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Services
import { livestreamService } from '../../services'; 
// NOTE: Once you have a 'getAllOrders' endpoint in AstrologerService, swap 'livestreamService' below.

const TABS = ['All', 'Calls', 'Chats', 'Live'];

const OrdersScreen = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Currently fetching streams. 
      // TODO: Replace with Promise.all([astrologerService.getOrders(), livestreamService.getMyStreams()])
      const response = await livestreamService.getMyStreams({ page: 1, limit: 20 });
      
      if (response.success && response.data?.streams) {
        // Map to a generic "Transaction" object structure
        const formattedData = response.data.streams.map(item => ({
          id: item._id,
          type: 'Live', // This will allow filtering
          title: item.title || 'Live Session',
          date: item.createdAt,
          amount: item.totalRevenue || 0,
          status: item.status === 'live' ? 'Active' : 'Completed',
          meta: `${item.totalViews || 0} views`
        }));
        setHistoryData(formattedData);
      }
    } catch (error) {
      console.error('History Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = historyData.filter(item => {
    if (selectedTab === 'All') return true;
    return item.type === selectedTab;
  });

  const renderItem = ({ item }) => {
    // Dynamic Icon based on type
    let iconName = 'videocam';
    let iconColor = '#FFB300';
    let bgColor = '#FFF8E1';

    if (item.type === 'Calls') { iconName = 'call'; iconColor = '#4CAF50'; bgColor = '#E8F5E9'; }
    if (item.type === 'Chats') { iconName = 'chatbubble'; iconColor = '#2196F3'; bgColor = '#E3F2FD'; }

    return (
      <View style={styles.itemCard}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
          <Text style={styles.itemMeta}>{item.meta}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemAmount}>+ ₹{item.amount}</Text>
          <View style={[styles.statusBadge, item.status === 'Active' ? styles.badgeActive : styles.badgeCompleted]}>
            <Text style={[styles.statusText, item.status === 'Active' ? styles.textActive : styles.textCompleted]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#5A5DC2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History & Earnings</Text>
        
        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5A5DC2" />
        </View>
      ) : (
        <FlatList 
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No records found for {selectedTab}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  header: { backgroundColor: '#5A5DC2', padding: 20, paddingBottom: 15, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#FFF' },
  tabText: { color: '#E0E0E0', fontWeight: '600' },
  tabTextActive: { color: '#5A5DC2', fontWeight: 'bold' },

  listContent: { padding: 16 },
  
  itemCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemDate: { fontSize: 12, color: '#888', marginVertical: 2 },
  itemMeta: { fontSize: 12, color: '#999' },
  
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeCompleted: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  textActive: { color: '#2E7D32' },
  textCompleted: { color: '#757575' },
  
  emptyText: { color: '#999', fontStyle: 'italic' },
});

export default OrdersScreen;
