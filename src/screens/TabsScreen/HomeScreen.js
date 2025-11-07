// src/screens/TabsScreen/HomeScreen.js (FULLY CORRECTED)
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OnlineOfflineButton from '../../component/OnilneOffilneButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { livestreamService } from '../../services';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { state } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [myStreams, setMyStreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userName = state.astrologer?.name || state.user?.name || 'Astrologer';

  // ✅ Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📊 [HomeScreen] Screen focused - fetching data');
      fetchData();
    }, [state.astrologer?._id]) // Refetch if astrologer ID changes
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [HomeScreen] Starting fetch...');
      console.log('📊 [HomeScreen] Auth state:', {
        isAuthenticated: state.isAuthenticated,
        hasAstrologer: !!state.astrologer,
        astrologerId: state.astrologer?._id,
      });

      // ✅ Check if authenticated
      if (!state.isAuthenticated || !state.astrologer) {
        console.warn('⚠️  [HomeScreen] Not authenticated');
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      // ✅ Fetch host analytics
      try {
        console.log('📈 [HomeScreen] Fetching analytics...');
        const analyticsResponse = await livestreamService.getHostAnalytics();
        
        console.log('✅ [HomeScreen] Analytics response:', {
          success: analyticsResponse.success,
          hasData: !!analyticsResponse.data,
        });

        if (analyticsResponse.success && analyticsResponse.data) {
          setStats(analyticsResponse.data);
          console.log('✅ [HomeScreen] Analytics set:', {
            revenue: analyticsResponse.data.totalRevenue,
            views: analyticsResponse.data.totalViews,
          });
        }
      } catch (analyticsError) {
        console.error('❌ [HomeScreen] Analytics error:', {
          message: analyticsError.message,
          status: analyticsError.response?.status,
        });
        
        if (analyticsError.response?.status === 401) {
          setError('Session expired. Please login again.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }
        
        // Don't fail completely, just skip analytics
        setStats(null);
      }

      // ✅ Fetch recent streams
      try {
        console.log('🎬 [HomeScreen] Fetching streams...');
        const streamsResponse = await livestreamService.getMyStreams({
          page: 1,
          limit: 5,
        });

        console.log('✅ [HomeScreen] Streams response:', {
          success: streamsResponse.success,
          count: streamsResponse.data?.streams?.length || 0,
        });

        if (streamsResponse.success && streamsResponse.data?.streams) {
          setMyStreams(streamsResponse.data.streams);
          
          // Check if any stream is currently live
          const liveStream = streamsResponse.data.streams.find(s => s.status === 'live');
          setHasLiveStream(!!liveStream);
          
          console.log('✅ [HomeScreen] Streams set:', {
            count: streamsResponse.data.streams.length,
            hasLive: !!liveStream,
          });
        } else {
          setMyStreams([]);
          setHasLiveStream(false);
        }
      } catch (streamsError) {
        console.error('❌ [HomeScreen] Streams error:', {
          message: streamsError.message,
          status: streamsError.response?.status,
        });

        if (streamsError.response?.status === 401) {
          setError('Session expired. Please login again.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
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
  };

  const onRefresh = async () => {
    console.log('🔄 [HomeScreen] Refreshing...');
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleGoLive = () => {
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
  };

  // Sample activity data
  const activityData = [
    {
      id: '1',
      name: 'Pooja K',
      time: '10 min',
      amount: '₹300',
      image: require('../../assets/astrofemale.png'),
    },
    {
      id: '2',
      name: 'Arjun Lose',
      time: '15 min',
      amount: '₹200',
      image: require('../../assets/astrofemale.png'),
    },
    {
      id: '3',
      name: 'Priya Love',
      time: '20 min',
      amount: '₹500',
      image: require('../../assets/astrofemale.png'),
    },
  ];

  // ✅ Loading state
  if (loading && !stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FFB300" />
          <Text style={{ marginTop: 12, color: '#666', fontSize: 14 }}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.headerContainer}>
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {userName
                  ? userName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)
                  : 'A'}
              </Text>
            </View>

            <View style={styles.nameGreetingContainer}>
              <Text style={styles.greetingText}>Good Morning</Text>
              <Text style={styles.profileName} numberOfLines={1}>
                Astrologer {userName}
              </Text>
            </View>
          </View>

          <View style={styles.rightContainer}>
            <OnlineOfflineButton />

            <View style={styles.notificationCard}>
              <TouchableOpacity
                onPress={() => Alert.alert('Notifications', 'No new notifications')}
              >
                <Ionicons name="notifications-outline" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Earnings Card */}
          {stats && (
            <View style={styles.earningsCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.earningsTitle}>Livestream Earnings</Text>
                <Text style={styles.earningsAmount}>
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '0'}
                </Text>
              </View>
              <View style={styles.monthlyRow}>
                <View>
                  <Text style={styles.monthlyEarned}>
                    Total Streams: {stats?.totalStreams || 0}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => Alert.alert('Coming Soon', 'Stream analytics coming soon!')}
                  style={{ marginTop: 8 }}
                >
                  <Text style={styles.viewDetails}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats */}
          {stats && (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Total Views</Text>
                  <Text style={styles.statValue}>
                    {stats?.totalViews?.toLocaleString('en-IN') || '0'}
                  </Text>
                  <Text style={styles.statSub}>All time</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Avg Peak Viewers</Text>
                  <Text style={styles.statValue}>{stats?.averagePeakViewers || '0'}</Text>
                  <Text style={styles.statSub}>Per stream</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Total Calls</Text>
                  <Text style={styles.statValue}>{stats?.totalCalls || '0'}</Text>
                  <Text style={styles.statSub}>Completed</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statTitle}>Call Revenue</Text>
                  <Text style={styles.statValue}>
                    ₹{stats?.totalCallRevenue?.toLocaleString('en-IN') || '0'}
                  </Text>
                  <Text style={styles.statSub}>From calls</Text>
                </View>
              </View>
            </>
          )}

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.liveBtn, hasLiveStream && styles.liveBtnActive]}
              onPress={handleGoLive}
            >
              <Text style={styles.liveText}>
                {hasLiveStream ? '🔴 Live Now' : '🔴 Go Live'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => navigation.navigate('MyStreams')}
            >
              <Text style={styles.quickText}>My Streams</Text>
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
                      Alert.alert(
                        'Stream Details',
                        `Stream: ${item.title}\nRevenue: ₹${item.totalRevenue || 0}\nViews: ${item.totalViews || 0}`
                      )
                    }
                  >
                    <View style={styles.streamIcon}>
                      <Ionicons name="videocam" size={24} color="#FFB300" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.userTime}>
                        {item.status === 'live'
                          ? '🔴 Live'
                          : new Date(item.createdAt).toLocaleDateString('en-IN')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
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

          {/* Recent Activity */}
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <FlatList
            data={activityData}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.activityCard}>
                <Image source={item.image} style={styles.userImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userTime}>{item.time}</Text>
                </View>
                <Text style={styles.amountText}>{item.amount}</Text>
              </View>
            )}
            scrollEnabled={false}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
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
    backgroundColor: '#372643',
    height: 100,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingLeft: 10,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nameGreetingContainer: {
    flexDirection: 'column',
    flexShrink: 1,
    minWidth: 0,
  },
  greetingText: {
    color: '#fff',
    fontSize: 12,
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingRight: 10,
  },
  notificationCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsCard: {
    backgroundColor: '#FF8C42',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  earningsTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  earningsAmount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 12,
  },
  monthlyRow: {
    flexDirection: 'column',
    gap: 8,
  },
  monthlyEarned: {
    color: '#fff',
    fontSize: 13,
  },
  viewDetails: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowRadius: 5,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  statTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    color: '#5A5DC2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    gap: 12,
  },
  liveBtn: {
    flex: 1,
    backgroundColor: '#FFB300',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  liveBtnActive: {
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFB300',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    color: '#222',
    marginLeft: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 70,
  },
  userImg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  streamIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  userTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  amountText: {
    fontWeight: '700',
    color: '#333',
    fontSize: 14,
  },
});
