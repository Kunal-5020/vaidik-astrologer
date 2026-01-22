import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  InteractionManager, // ✅ Import for transition handling
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OnlineOfflineButton from '../../component/OnilneOffilneButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { livestreamService } from '../../services';
import { astrologerService } from '../../services/api/astrologer.service';
import astrologerOrderService from '../../services/api/astrologer-order.service';
import ScreenWrapper from '../../component/ScreenWrapper';
import { styles } from '../../style/HomeStyle';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { state } = useAuth();
  const astrologerId = state.astrologer?._id || state.astrologer?.id;
  const { unreadCount } = useNotifications();

  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [myStreams, setMyStreams] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Use ref to track if screen is fully mounted
  const isMountedRef = useRef(false);
  const hasShownAlertRef = useRef(false); // ✅ Track if alert was already shown

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
    // ✅ Prevent showing alert multiple times
    if (hasShownAlertRef.current) {
      console.log('⏭️ [HomeScreen] Alert already shown, skipping');
      return;
    }

    console.log('📢 [HomeScreen] Showing pricing setup alert');
    hasShownAlertRef.current = true;

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

  // Helper to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      console.log('🔍 [HomeScreen] Starting fetch...');

      if (!state.isAuthenticated || !state.astrologer) {
        console.warn('⚠️ [HomeScreen] Not authenticated');
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      // 1. Fetch Stats
      try {
        const statsResponse = await astrologerService.getStats();
        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }
      } catch (e) { 
        console.error('Stats error:', e.message); 
      }

      // 2. Fetch Earnings
      try {
        const earningsResponse = await astrologerService.getEarnings();
        if (earningsResponse?.success) {
          setEarnings(earningsResponse.data);
        }
      } catch (e) { 
        console.error('Earnings error:', e.message); 
      }

      // 3. Fetch Streams
      try {
        const streamsResponse = await livestreamService.getMyStreams({ page: 1, limit: 5 });
        if (streamsResponse.success && streamsResponse.data?.streams) {
          setMyStreams(streamsResponse.data.streams);
          const liveStream = streamsResponse.data.streams.find(s => s.status === 'live');
          setHasLiveStream(!!liveStream);
        }
      } catch (e) { 
        console.error('Streams error:', e.message); 
      }

      // 4. Fetch Recent Orders
      try {
        console.log('📦 [HomeScreen] Fetching recent orders...');
        const ordersResponse = await astrologerOrderService.getAstrologerOrders({ 
          page: 1, 
          limit: 5 
        });
        
        if (ordersResponse.success && ordersResponse.orders) {
          const formattedOrders = ordersResponse.orders.map(order => ({
            id: order.orderId,
            customerName: order.userId?.name || 'User',
            customerImage: order.userId?.profileImage || order.userId?.profilePicture,
            amount: order.totalAmount || 0,
            type: order.serviceType || 'Chat/Call',
            duration: formatDuration(order.totalUsedDurationSeconds),
            date: order.createdAt
          }));
          setRecentOrders(formattedOrders);
        } else {
          setRecentOrders([]);
        }
      } catch (ordersError) {
        console.error('❌ [HomeScreen] Orders error:', ordersError.message);
        setRecentOrders([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [HomeScreen] General error:', error);
      setError('Failed to load dashboard');
      setLoading(false);
    }
  }, [state.isAuthenticated, astrologerId]);

  // ✅ FIXED: Delayed pricing check with proper timing
  const checkPricingSetup = useCallback(() => {
    if (!astrologer || !isMountedRef.current) {
      console.log('⏸️ [HomeScreen] Screen not ready for pricing check');
      return;
    }

    console.log('🔍 [HomeScreen] Checking pricing setup...', {
      profileComplete: astrologer.profileCompletion?.isComplete,
      hasShownAlert: hasShownAlertRef.current,
    });

    // Only show if profile is incomplete and alert hasn't been shown
    if (astrologer.profileCompletion?.isComplete === false && !hasShownAlertRef.current) {
      // ✅ Use InteractionManager to wait for animations to complete
      InteractionManager.runAfterInteractions(() => {
        // ✅ Add additional delay to ensure screen is fully loaded
        setTimeout(() => {
          if (isMountedRef.current) {
            showPricingAlert();
          }
        }, 800); // 800ms delay after interactions complete
      });
    }
  }, [astrologer, showPricingAlert]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
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
    navigation.navigate('Notifications');
  }, [navigation]);

  // ✅ FIXED: Proper lifecycle management
 useFocusEffect(
  useCallback(() => {
    isMountedRef.current = true;

    let isActive = true;
    const run = async () => {
      await fetchData();        // fetch once per focus
      if (isActive) checkPricingSetup(); // run after fetch completes
    };
    run();

    return () => {
      isActive = false;
      isMountedRef.current = false;
    };
  }, [fetchData, checkPricingSetup]) // ✅ removed loading
);

  // ✅ Reset alert flag when astrologer changes (e.g., after profile update)
  useEffect(() => {
    if (astrologer?.profileCompletion?.isComplete === true) {
      hasShownAlertRef.current = false;
    }
  }, [astrologer?.profileCompletion?.isComplete]);

  // Derived Stats
  const totalOrders = stats?.totalOrders || 0;
  const callOrders = stats?.callOrders || 0;
  const chatOrders = stats?.chatOrders || 0;
  const streamOrders = stats?.streamOrders || 0;
  const totalEarnedVal = earnings?.totalEarned || 0;
  const totalMinutes = stats?.totalMinutes || 0;

  // ✅ Show loading state while fetching initial data
  if (loading && !stats && !refreshing) {
    return (
      <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.profileContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileCircle}>
                <Text style={styles.profileInitial}>
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </Text>
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.greetingText}>Hi,</Text>
              <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
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
              {/* ✅ Red Dot for Unread Notifications */}
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
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
              <Text style={styles.earningsAmount}>₹{totalEarnedVal.toLocaleString('en-IN')}</Text>
              <Text style={styles.monthlyEarned}>Total Minutes: {totalMinutes}m</Text>
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
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{callOrders}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="chatbubbles" size={22} color="#10B981" />
              <Text style={styles.statTitle}>Chat Orders</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{chatOrders}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="videocam" size={22} color="#F59E0B" />
              <Text style={styles.statTitle}>Stream Orders</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{streamOrders}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#E8EAF6' }]}>
              <Ionicons name="stats-chart" size={22} color="#372643" />
              <Text style={styles.statTitle}>Total Orders</Text>
              <Text style={[styles.statValue, { color: '#372643' }]}>{totalOrders}</Text>
            </View>
          </View>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.liveBtn, hasLiveStream && styles.liveBtnActive]}
              onPress={handleGoLive}
              activeOpacity={0.8}
            >
              <Text style={styles.liveText}>{hasLiveStream ? '🔴 Live Now' : '🔴 Go Live'}</Text>
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
              {myStreams.map((item) => (
                <TouchableOpacity
                  key={item._id || item.streamId}
                  style={styles.activityCard}
                  onPress={() => navigation.navigate('StreamAnalytics', { streamId: item.streamId })}
                  activeOpacity={0.7}
                >
                  <View style={styles.streamIcon}>
                    <Ionicons name="videocam" size={22} color="#F59E0B" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.userName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.userTime}>
                      {item.status === 'live' ? '🔴 Live' : new Date(item.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.amountText}>₹{item.totalRevenue?.toLocaleString('en-IN') || '0'}</Text>
                    <Text style={styles.userTime}>{item.totalViews?.toLocaleString('en-IN') || 0} views</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Recent Orders */}
          {recentOrders && recentOrders.length > 0 && (
            <>
              <Text style={styles.recentTitle}>Recent Orders</Text>
              {recentOrders.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.activityCard}
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
                    <Text style={styles.userName} numberOfLines={1}>{item.customerName}</Text>
                    <Text style={styles.userTime}>{item.duration}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.amountText}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                    <Text style={styles.orderType}>{item.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Empty State */}
          {(!recentOrders || recentOrders.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Recent Orders</Text>
              <Text style={styles.emptyStateText}>Your recent consultations will appear here</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default DashboardScreen;
