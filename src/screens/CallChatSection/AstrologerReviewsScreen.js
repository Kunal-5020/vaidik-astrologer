import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AstrologerReviewService from '../../services/api/AstrologerReviewService';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from '../../style/AstrologerReviewsStyle';

const AstrologerReviewsScreen = ({ navigation }) => {
  const { astrologer } = useAuth();
  const astrologerId = astrologer?._id || astrologer?.id;
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (astrologerId) {
        loadData();
    }
  }, [astrologerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // ✅ FIX: Pass astrologerId to the service calls
      const [statsRes, reviewsRes] = await Promise.all([
        AstrologerReviewService.getStats(astrologerId),
        AstrologerReviewService.getMyReviews(astrologerId, 1, 20)
      ]);

      if (statsRes && statsRes.success !== false) setStats(statsRes); // API might return data directly or wrapped
      if (reviewsRes && reviewsRes.reviews) setReviews(reviewsRes.reviews || []); // Check backend response structure
      
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Icon 
        key={i} 
        name={i < rating ? "star" : "star-outline"} 
        size={14} 
        color="#FFD700" 
      />
    ));
  };

  const renderReviewItem = ({ item }) => {
    // ✅ Fix: Use the correct field names from your backend response
    const imageUri = item.userProfileImage || item.testUserImage || 'https://via.placeholder.com/40';
    const name = item.userName || item.testUserName || 'Anonymous';
    
    // ✅ Fix: Use 'reviewDate' instead of 'createdAt' if that's what your backend sends
    // Fallback to createdAt if reviewDate is missing
    const dateString = item.reviewDate || item.createdAt;
    const formattedDate = dateString ? new Date(dateString).toLocaleDateString() : 'Recent';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Icon name="star" size={12} color="#FFF" />
          </View>
        </View>

        {item.reviewText ? (
          <Text style={styles.reviewText}>{item.reviewText}</Text>
        ) : (
          <Text style={styles.noText}>No written feedback</Text>
        )}

        <View style={styles.cardFooter}>
           <Icon name={item.serviceType === 'call' ? 'phone' : 'chat'} size={12} color="#999" />
           <Text style={styles.serviceType}>{item.serviceType?.toUpperCase() || 'SESSION'}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content" safeAreaTop={false}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>My Reviews</Text>
            <Text style={styles.headerSubtitle}>Total {stats.totalReviews} reviews</Text>
        </View>
        <View style={styles.bigRating}>
            <Text style={styles.bigRatingText}>{stats.averageRating.toFixed(1)}</Text>
            <Icon name="star" size={24} color="#FFD700" />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item._id || item.reviewId}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="comment-text-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No reviews yet</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default AstrologerReviewsScreen;