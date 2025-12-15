import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RemediesBackendService from '../../services/shopify/remediesBackend.service';

const AstrologerSuggestedRemediesScreen = ({ navigation, route }) => {
  const { orderId, userName } = route.params;

  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemedies();
  }, []);

  const loadRemedies = async () => {
    try {
      setLoading(true);
      // Fetch remedies for this specific order
      const response = await RemediesBackendService.getAstrologerOrderRemedies(orderId);
      if (response?.success) {
        setRemedies(response.data.remedies || []);
      }
    } catch (error) {
      console.error('Error loading remedies:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRemedy = ({ item }) => {
    const isProduct = item.remedySource === 'shopify_product';
    const product = item.shopifyProduct;

    return (
      <View style={styles.card}>
        {/* Header: Type & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.typeTag}>
            <Icon 
              name={isProduct ? 'shopping' : 'text-box-outline'} 
              size={14} 
              color="#000" 
            />
            <Text style={styles.typeText}>
              {isProduct ? 'Product' : 'Manual'}
            </Text>
          </View>
          <View style={[
            styles.statusTag, 
            item.isPurchased ? styles.statusPurchased : styles.statusSuggested
          ]}>
            <Text style={styles.statusText}>
              {item.isPurchased ? 'Purchased' : 'Suggested'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          {isProduct && product ? (
            <Image
              source={product.imageUrl ? { uri: product.imageUrl } : require('../../assets/onlyLogoVaidik.png')}
              style={styles.productImage}
            />
          ) : null}

          <View style={styles.contentCol}>
            <Text style={styles.title}>
              {isProduct ? product?.productName : item.title}
            </Text>
            
            {isProduct && (
              <Text style={styles.price}>₹{product?.price}</Text>
            )}

            <Text style={styles.label}>Reason:</Text>
            <Text style={styles.description} numberOfLines={3}>
              {item.recommendationReason}
            </Text>
          </View>
        </View>

        {/* Footer: Dates */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            Suggested: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.isPurchased && (
             <Text style={[styles.dateText, { color: '#4CAF50' }]}>
               Purchased: {new Date(item.purchaseDetails.purchasedAt).toLocaleDateString()}
             </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Suggested Remedies</Text>
          <Text style={styles.headerSubtitle}>for Order #{orderId.slice(-6)} ({userName})</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={remedies}
          keyExtractor={(item) => item.remedyId}
          renderItem={renderRemedy}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="playlist-remove" size={60} color="#555" />
              <Text style={styles.emptyText}>No remedies suggested yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C1317' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2C34',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  headerCenter: { marginLeft: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#8696A0' },
  
  listContent: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    backgroundColor: '#1F2C34',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A3942',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeText: { fontSize: 11, fontWeight: '700', color: '#000' },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSuggested: { backgroundColor: '#455A64' },
  statusPurchased: { backgroundColor: '#4CAF50' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

  cardBody: {
    flexDirection: 'row',
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2A3942',
    marginRight: 12,
  },
  contentCol: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  label: { fontSize: 11, color: '#8696A0', marginTop: 4 },
  description: { fontSize: 13, color: '#E9EDEF', lineHeight: 18 },

  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 11, color: '#8696A0' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#8696A0', marginTop: 16 },
});

export default AstrologerSuggestedRemediesScreen;