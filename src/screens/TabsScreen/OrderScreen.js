import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';

const ordersData = [
  {
    id: '1',
    name: 'Pooja K',
    orderId: 'THD4ER9K',
    type: 'Chat',
    date: 'Today',
    amount: 5990,
    status: 'active',
  },
  {
    id: '2',
    name: 'Rajesh S',
    orderId: 'XYZ123AB',
    type: 'Video Call',
    date: 'Yesterday',
    amount: 153000,
    status: 'completed',
  },
  {
    id: '3',
    name: 'Priya M',
    orderId: 'ABC789DE',
    type: 'Voice Call',
    date: '11/1/2025',
    amount: 10500,
    status: 'pending',
  },
  {
    id: '4',
    name: 'Amit K',
    orderId: 'DEF456GH',
    type: 'Chat + Call',
    date: 'Today',
    amount: 2500,
    status: 'active',
  },
];

const quickActions = [
  { id: '1', name: 'Pooja K', type: 'Chat+Call', date: 'Today', amount: 3000 },
  { id: '2', name: 'Kapri E', type: 'Video', date: 'Today', amount: 5500 },
];

const tabs = ['All', 'Active', 'Pending', 'Completed'];

const OrdersScreen = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const filteredOrders =
    selectedTab === 'All'
      ? ordersData
      : ordersData.filter(
          order => order.status.toLowerCase() === selectedTab.toLowerCase(),
        );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {item.name
            .split(' ')
            .map(n => n[0])
            .join('')}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderName}>{item.name}</Text>
        <Text style={styles.orderDetail}>Order ID: {item.orderId}</Text>
        <Text style={styles.orderDetail}>
          {item.type} - {item.date}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.orderAmount}>₹{item.amount.toLocaleString()}</Text>
        <Text
          style={[
            styles.orderStatus,
            item.status === 'active'
              ? styles.activeStatus
              : item.status === 'completed'
              ? styles.completedStatus
              : styles.pendingStatus,
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderQuickActionItem = item => (
    <View key={item.id} style={styles.quickCard}>
      <View style={styles.quickActionRow}>
        <View style={styles.quickAvatar}>
          <Text style={styles.quickAvatarText}>
            {item.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </Text>
        </View>
        <View>
          <Text style={styles.quickName}>{item.name}</Text>
          <Text style={styles.quickType}>
            {item.type} - {item.date}
          </Text>
        </View>
        <Text style={styles.quickAmount}>₹{item.amount.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                selectedTab === tab && styles.selectedTab,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.selectedTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          scrollEnabled={false} // Disable inner scroll
          contentContainerStyle={{ paddingVertical: 12 }}
        />

        <Text style={styles.quickTitle}>Quick Actions</Text>
        {quickActions.map(renderQuickActionItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  headerContainer: {
    backgroundColor: '#5A5DC2',
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 23,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8888b8',
    marginHorizontal: 4,
  },
  selectedTab: {
    backgroundColor: '#FF8C42',
  },
  tabText: {
    color: '#d1d1f7',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedTabText: {
    color: '#fff',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#c7c7dd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '700',
    color: '#666',
    fontSize: 15,
  },
  orderName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 3,
  },
  orderDetail: {
    color: '#666',
    fontSize: 13,
  },
  orderAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  orderStatus: {
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
    textAlign: 'right',
  },
  activeStatus: {
    color: '#2aa152',
  },
  completedStatus: {
    color: '#939393',
  },
  pendingStatus: {
    color: '#c98925',
  },
  quickTitle: {
    fontWeight: '600',
    fontSize: 17,
    marginVertical: 14,
    color: '#4B4F7D',
    paddingLeft: 12,
  },
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffd39c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickAvatarText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#E17B00',
  },
  quickName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
  },
  quickType: {
    fontSize: 12,
    color: '#999',
  },
  quickAmount: {
    marginLeft: 'auto',
    color: '#E17B00',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrdersScreen;
