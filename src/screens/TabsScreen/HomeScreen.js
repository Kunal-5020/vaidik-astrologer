// src/screens/TabsScreen/HomeScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OnlineOfflineButton from '../../component/OnilneOffilneButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { livestreamService } from '../../services';
import { astrologerService } from '../../services/api/astrologer.service';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { state } = useAuth();

  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [myStreams, setMyStreams] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingChecked, setPricingChecked] = useState(false);

  const astrologer = state.astrologer;
  const profilePicture = astrologer?.profilePicture;

  const getDisplayName = () => {
    const fullName = astrologer?.name || state.user?.name || 'Astrologer';
    const nameParts = fullName.trim().split(' ');

    if (nameParts.length === 1 || fullName.length <= 15) {
      return fullName;
    }

    const firstName = nameParts[0];
    const lastInitial = nameParts[nameParts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  };

  const displayName = getDisplayName();

  const showPricingAlert = useCallback(() => {
    Alert.alert(
      'Setup Required',
      'Please set your chat and call rates to start accepting consultations.',
      [
        {
          text: 'Setup Now',
          onPress: () => {
            console.log('🔧 [HomeScreen] Navigating to Services');
            navigation.navigate('Services');
          },
        },
        {
          text: 'Later',
          style: 'cancel',
          onPress: () => {
            console.log('⏰ [HomeScreen] User chose to setup later');
          },
        },
      ],
      { cancelable: false }
    );
  }, [navigation]);

  const handleSessionExpiry = useCallback(() => {
    setError('Session expired. Please login again.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [HomeScreen] Starting fetch...');

      if (!state.isAuthenticated || !state.astrologer) {
        console.warn('⚠️  [HomeScreen] Not authenticated');
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      try {
        console.log('📊 [HomeScreen] Fetching astrologer stats...');
        const statsResponse = await astrologerService.getStats();

        if (statsResponse?.success) {
          setStats(statsResponse.data);
          console.log('✅ [HomeScreen] Stats loaded:', statsResponse.data);
        }
      } catch (statsError) {
        console.error('❌ [HomeScreen] Stats error:', statsError.message);
        if (statsError.response?.status === 401) {
          handleSessionExpiry();
          return;
        }
        setStats(null);
      }

      try {
        console.log('💰 [HomeScreen] Fetching earnings...');
        const earningsResponse = await astrologerService.getEarnings();

        if (earningsResponse?.success) {
          setEarnings(earningsResponse.data);
          console.log('✅ [HomeScreen] Earnings loaded:', earningsResponse.data);
        }
      } catch (earningsError) {
        console.error('❌ [HomeScreen] Earnings error:', earningsError.message);
        setEarnings(null);
      }

      try {
        console.log('🎬 [HomeScreen] Fetching streams...');
        const streamsResponse = await livestreamService.getMyStreams({
          page: 1,
          limit: 5,
        });

        if (streamsResponse.success && streamsResponse.data?.streams) {
          setMyStreams(streamsResponse.data.streams);

          const liveStream = streamsResponse.data.streams.find(
            s => s.status === 'live'
          );
          setHasLiveStream(!!liveStream);
        } else {
          setMyStreams([]);
          setHasLiveStream(false);
        }
      } catch (streamsError) {
        console.error('❌ [HomeScreen] Streams error:', streamsError.message);
        if (streamsError.response?.status === 401) {
          handleSessionExpiry();
          return;
        }
        setMyStreams([]);
        setHasLiveStream(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [HomeScreen] General error:', error);
      setError('Failed to load dashboard');
      setLoading(false);
    }
  }, [state.isAuthenticated, state.astrologer, handleSessionExpiry]);

  const checkPricingSetup = useCallback(() => {
    if (!astrologer) return;

    const { pricing, profileCompletion } = astrologer;

    console.log('💰 [HomeScreen] Pricing check:', {
      chatRate: pricing?.chat,
      callRate: pricing?.call,
      isProfileComplete: profileCompletion?.isComplete,
      pricingStepComplete: profileCompletion?.steps?.pricing,
    });

    const isChatRateSet = pricing?.chat && pricing.chat > 0;
    const isCallRateSet = pricing?.call && pricing.call > 0;

    if (!isChatRateSet || !isCallRateSet) {
      if (!pricingChecked) {
        setPricingChecked(true);
        showPricingAlert();
      }
    }
  }, [astrologer, pricingChecked, showPricingAlert]);

  const onRefresh = useCallback(async () => {
    console.log('🔄 [HomeScreen] Refreshing...');
    setRefreshing(true);
    setPricingChecked(false);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleGoLive = useCallback(() => {
    if (hasLiveStream) {
      const liveStream = myStreams.find(s => s.status === 'live');
      if (liveStream) {
        navigation.navigate('Go-Live', {
          streamId: liveStream.streamId,
          channelName: liveStream.channelName,
          title: liveStream.title,
        });
      }
    } else {
      navigation.navigate('GoLiveSetup');
    }
  }, [hasLiveStream, myStreams, navigation]);

  const handleNotificationPress = useCallback(() => {
    console.log('🔔 [HomeScreen] Navigating to Notifications');
    navigation.navigate('Notifications');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      console.log('📊 [HomeScreen] Screen focused - checking pricing');
      checkPricingSetup();
      fetchData();
    }, [checkPricingSetup, fetchData])
  );

  const totalOrders = stats?.totalOrders || 0;
  const callOrders = stats?.callOrders || 0;
  const chatOrders = stats?.chatOrders || 0;
  const streamOrders = stats?.streamOrders || 0;
  const totalEarned = earnings?.totalEarned || 0;
  const totalMinutes = stats?.totalMinutes || 0;

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.profileContainer}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>
                  {displayName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              </View>
            )}

            <View style={styles.nameContainer}>
              <Text style={styles.greetingText}>Hi,</Text>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <View style={styles.onlineToggleWrapper}>
              <OnlineOfflineButton />
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleNotificationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scrollable Content */}
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
          {/* Earnings Card */}
          <View style={styles.earningsCard}>
            <View style={styles.earningsContent}>
              <Text style={styles.earningsTitle}>Total Earnings</Text>
              <Text style={styles.earningsAmount}>
                ₹{totalEarned.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.monthlyEarned}>
                Total Minutes: {totalMinutes}m
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('PerformanceAnalysis')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewDetails}>View Details →</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="call" size={22} color="#3B82F6" />
              <Text style={styles.statTitle}>Call Orders</Text>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                {callOrders}
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="chatbubbles" size={22} color="#10B981" />
              <Text style={styles.statTitle}>Chat Orders</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {chatOrders}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="videocam" size={22} color="#F59E0B" />
              <Text style={styles.statTitle}>Stream Orders</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {streamOrders}
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#E8EAF6' }]}>
              <Ionicons name="stats-chart" size={22} color="#372643" />
              <Text style={styles.statTitle}>Total Orders</Text>
              <Text style={[styles.statValue, { color: '#372643' }]}>
                {totalOrders}
              </Text>
            </View>
          </View>

          {/* Buttons Row */}
<View style={styles.buttonRow}>
  <TouchableOpacity
    style={[styles.liveBtn, hasLiveStream && styles.liveBtnActive]}
    onPress={handleGoLive}
    activeOpacity={0.8}
  >
    <Text style={styles.liveText}>
      {hasLiveStream ? '🔴 Live Now' : '🔴 Go Live'}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.secondaryBtn}
    onPress={() => navigation.navigate('MyStreams')}
    activeOpacity={0.8}
  >
    <Text style={styles.secondaryText}>My Streams</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.secondaryBtn}
    onPress={() => navigation.navigate('WalletWithdraw')}
    activeOpacity={0.8}
  >
    <Text style={styles.secondaryText}>Withdraw</Text>
  </TouchableOpacity>
</View>


          {/* Recent Streams */}
          {myStreams && myStreams.length > 0 && (
            <>
              <Text style={styles.recentTitle}>Recent Streams</Text>
              <FlatList
                data={myStreams}
                keyExtractor={item => item._id || item.streamId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.activityCard}
                    onPress={() =>
                      navigation.navigate('StreamAnalytics', {
                        streamId: item.streamId,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.streamIcon}>
                      <Ionicons name="videocam" size={22} color="#F59E0B" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.userTime}>
                        {item.status === 'live'
                          ? '🔴 Live'
                          : new Date(item.createdAt).toLocaleDateString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.amountText}>
                        ₹{item.totalRevenue?.toLocaleString('en-IN') || '0'}
                      </Text>
                      <Text style={styles.userTime}>
                        {item.totalViews?.toLocaleString('en-IN') || 0} views
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Recent Orders */}
          {recentOrders && recentOrders.length > 0 && (
            <>
              <Text style={styles.recentTitle}>Recent Orders</Text>
              <FlatList
                data={recentOrders}
                keyExtractor={item => item._id || item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.activityCard}
                    onPress={() =>
                      Alert.alert(
                        'Order Details',
                        `Customer: ${item.customerName}\nAmount: ₹${item.amount}\nType: ${item.type}`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Image
                      source={
                        item.customerImage
                          ? { uri: item.customerImage }
                          : require('../../assets/astrofemale.png')
                      }
                      style={styles.userImg}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {item.customerName}
                      </Text>
                      <Text style={styles.userTime}>
                        {item.duration || item.type}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.amountText}>
                        ₹{item.amount?.toLocaleString('en-IN') || '0'}
                      </Text>
                      <Text style={styles.orderType}>{item.type}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Empty State */}
          {(!recentOrders || recentOrders.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Recent Orders</Text>
              <Text style={styles.emptyStateText}>
                Your recent consultations will appear here
              </Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: Math.min(screenWidth * 0.04, 16),
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    flex: 1,
  },
  retryText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 10,
  },

  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#372643',
    minHeight: 75,
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    marginRight: 12,
  },
  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  nameContainer: {
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  greetingText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 2,
  },
  profileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineToggleWrapper: {},
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  earningsCard: {
    backgroundColor: '#372643',
    marginHorizontal: Math.min(screenWidth * 0.04, 16),
    marginTop: 14,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  earningsContent: {
    flex: 1,
  },
  earningsTitle: {
    color: '#D1D5DB',
    fontSize: 12,
    marginBottom: 4,
  },
  earningsAmount: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 6,
  },
  monthlyEarned: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  viewDetails: {
    color: '#8B5CF6',
    textDecorationLine: 'underline',
    fontSize: 12,
    fontWeight: '600',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: Math.min(screenWidth * 0.04, 16),
    gap: 10,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    flex: 1,
  },
  statTitle: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 6,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 16,
  marginHorizontal: Math.min(screenWidth * 0.04, 16),
  gap: 8,
},
liveBtn: {
  flex: 1.2,
  backgroundColor: '#F59E0B',
  paddingVertical: 13,
  borderRadius: 10,
  alignItems: 'center',
},
liveBtnActive: {
  backgroundColor: '#EF4444',
},
liveText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 13,
},
secondaryBtn: {
  flex: 1,
  borderWidth: 1.5,
  borderColor: '#372643',
  paddingVertical: 13,
  borderRadius: 10,
  alignItems: 'center',
},
secondaryText: {
  color: '#372643',
  fontWeight: '600',
  fontSize: 13,
},

  quickBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#372643',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickText: {
    color: '#372643',
    fontWeight: '600',
    fontSize: 13,
  },

  recentTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
    color: '#111827',
    marginLeft: Math.min(screenWidth * 0.04, 16),
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: Math.min(screenWidth * 0.04, 16),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    minHeight: 65,
  },
  userImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  streamIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  userTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 13,
  },
  orderType: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: Math.min(screenWidth * 0.04, 16),
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
