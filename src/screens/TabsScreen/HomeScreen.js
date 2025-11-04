import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OnilneOfflineButton from '../../component/OnilneOffilneButton';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { livestreamService } from '../../services';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { state } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [myStreams, setMyStreams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLiveStream, setHasLiveStream] = useState(false);

  const userName = state.astrologer?.name || state.user?.name || 'User';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch host analytics
      const analyticsResponse = await livestreamService.getHostAnalytics();
      if (analyticsResponse.success) {
        setStats(analyticsResponse.data);
      }

      // Fetch recent streams
      const streamsResponse = await livestreamService.getMyStreams({
        page: 1,
        limit: 5,
      });
      if (streamsResponse.success) {
        setMyStreams(streamsResponse.data.streams);
        
        // Check if any stream is currently live
        const liveStream = streamsResponse.data.streams.find(s => s.status === 'live');
        setHasLiveStream(!!liveStream);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleGoLive = () => {
    if (hasLiveStream) {
      // If already have a live stream, navigate to it
      const liveStream = myStreams.find(s => s.status === 'live');
      navigation.navigate('Go-Live', {
        streamId: liveStream.streamId,
        // ... other params
      });
    } else {
      // Navigate to setup screen
      navigation.navigate('GoLiveSetup');
    }
  };

  const data = [
    {
      id: '1',
      name: 'Pooja K',
      time: '10 min',
      amount: '₹300',
      image: require('../../assets/astrofemale.png'),
    },
    {
      id: '2',
      name: 'Arjeal Lose',
      time: '10 min',
      amount: '$200',
      image: require('../../assets/astrofemale.png'),
    },
    {
      id: '3',
      name: 'Linteal Love',
      time: '10 min',
      amount: '₹500',
      image: require('../../assets/astrofemale.png'),
    },
  ];

  return (
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
                : ''}
            </Text>
          </View>

          <View style={styles.nameGreetingContainer}>
            <Text style={styles.greetingText}>Good Morning</Text>
            <Text style={styles.profileName}>Astrologer {userName}</Text>
          </View>
        </View>

        <View style={styles.rightContainer}>
          <OnilneOfflineButton />

          <View style={styles.notificationCard}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Livestream Earnings</Text>
          <Text style={styles.earningsAmount}>
            ₹{stats?.totalRevenue?.toLocaleString() || 0}
          </Text>
          <View style={styles.monthlyRow}>
            <Text style={styles.monthlyEarned}>
              Total Streams: {stats?.totalStreams || 0}
            </Text>
           <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Stream analytics coming soon!')}>
  <Text style={styles.viewDetails}>View Details</Text>
</TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Total Views</Text>
            <Text style={styles.statValue}>{stats?.totalViews?.toLocaleString() || 0}</Text>
            <Text style={styles.statSub}>All time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Avg Peak Viewers</Text>
            <Text style={styles.statValue}>{stats?.averagePeakViewers || 0}</Text>
            <Text style={styles.statSub}>Per stream</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Total Calls</Text>
            <Text style={styles.statValue}>{stats?.totalCalls || 0}</Text>
            <Text style={styles.statSub}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Call Revenue</Text>
            <Text style={styles.statValue}>₹{stats?.totalCallRevenue?.toLocaleString() || 0}</Text>
            <Text style={styles.statSub}>From calls</Text>
          </View>
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.liveBtn, hasLiveStream && styles.liveBtnActive]}
            onPress={handleGoLive}
          >
            <Text style={styles.liveText}>
              {hasLiveStream ? '🔴 Live Now' : 'Go Live'}
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
        {myStreams.length > 0 && (
          <>
            <Text style={styles.recentTitle}>Recent Streams</Text>
            <FlatList
              data={myStreams}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.activityCard}
                   onPress={() => Alert.alert('Stream Details', `Stream: ${item.title}\nRevenue: ₹${item.totalRevenue}`)}
                >
                  <View style={styles.streamIcon}>
                    <Ionicons name="videocam" size={24} color="#FFB300" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{item.title}</Text>
                    <Text style={styles.userTime}>
                      {item.status === 'live' ? '🔴 Live' : new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountText}>₹{item.totalRevenue || 0}</Text>
                    <Text style={styles.userTime}>{item.totalViews} views</Text>
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
          data={data}
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
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    // paddingHorizontal: 16,
    alignContent: 'center',
    top: -6,
  },
  header: {
    backgroundColor: '#372643',
    // height: 90,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bellContainer: {
    position: 'relative',
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 50,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  earningCard: {
    backgroundColor: '#E6E0FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E1DDB',
  },
  monthText: {
    color: '#444',
    marginTop: 4,
  },
  detailsButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  detailsText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 13,
    color: '#444',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    gap: 15, // optional spacing between buttons
  },

  liveBtn: {
    width: '45%', // reduced width
    backgroundColor: '#FFB300',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  liveText: {
    color: '#fff',
    fontWeight: '600',
  },

  quickBtn: {
    width: '45%', // reduced width
    borderWidth: 1,
    borderColor: '#999',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  quickText: {
    color: '#333',
    fontWeight: '600',
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    color: '#222',
    left: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'lightgrey',
    width: '95%',
    height: 70,
    left: 10,
  },
  userImg: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  userTime: {
    fontSize: 12,
    color: '#777',
  },
  amountText: {
    fontWeight: '700',
    color: '#333',
  },

  //   =============header style ===

  headerContainer: {
    // flex:1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#372643',
    height: 100,
    // paddingHorizontal: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    // fix width overflow issue
    left: 2,
  },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // ensures profile section uses available space
    minWidth: 0, // allows text to truncate
    left: 10,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nameGreetingContainer: {
    flexDirection: 'column',
    flexShrink: 1,
    minWidth: 0, // allows text to shrink if too long
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 130, //
  },
  greetingText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    right: 65,
  },

  onlineButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 40,
  },
  onlineText: {
    color: '#fff',
    fontWeight: '600',
  },

  notificationCard: {
    justifyContent: 'center',
    alignItems: 'center',
    left: 50,
  },

  //   ====earning
  earningsCard: {
    backgroundColor: '#FF8C42',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    width: '95%',
    right: 6,
  },
  earningsTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  earningsAmount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 8,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthlyEarned: {
    color: '#fff',
    fontSize: 14,
  },
  viewDetails: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginHorizontal: 1,
    marginTop: 10,
  },
  statBox: {
    // flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginHorizontal: 4,
    alignItems: 'flex-start',
    shadowColor: '#000',
    // shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    height: 99,
    width: '45%',
  },
  statTitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 20,
    color: '#5A5DC2',
    fontWeight: 'bold',
  },
  liveBtnActive: {
    backgroundColor: '#EF4444',
  },
  streamIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
