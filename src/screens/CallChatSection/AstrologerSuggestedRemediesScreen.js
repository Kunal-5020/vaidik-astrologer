import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import RemediesBackendService from '../../services/shopify/remediesBackend.service';
import { styles, COLORS } from '../../style/AstrologerSuggestedRemediesStyle';

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
              color={COLORS.PRIMARY}
            />
            <Text style={styles.typeText}>
              {isProduct ? 'Product' : 'Manual'}
            </Text>
          </View>
          <View style={[
            styles.statusTag, 
            item.isPurchased ? styles.statusPurchased : styles.statusSuggested
          ]}>
            <Icon 
              name={item.isPurchased ? 'check-circle' : 'clock-outline'} 
              size={12} 
              color="#FFF" 
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statusText}>
              {item.isPurchased ? 'Purchased' : 'Suggested'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          {isProduct && product ? (
            <View style={styles.imageContainer}>
              <Image
                source={product.imageUrl ? { uri: product.imageUrl } : require('../../assets/onlyLogoVaidik.png')}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <View style={styles.contentCol}>
            <Text style={styles.title} numberOfLines={2}>
              {isProduct ? product?.productName : item.title}
            </Text>
            
            {isProduct && (
              <View style={styles.priceRow}>
                <Icon name="currency-inr" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.price}>{product?.price}</Text>
              </View>
            )}

            <View style={styles.reasonSection}>
              <View style={styles.labelRow}>
                <Icon name="lightbulb-on-outline" size={14} color={COLORS.ACCENT} />
                <Text style={styles.label}>Recommendation Reason</Text>
              </View>
              <Text style={styles.description} numberOfLines={3}>
                {item.recommendationReason}
              </Text>
            </View>

            {item.usageInstructions && (
              <View style={styles.instructionsSection}>
                <View style={styles.labelRow}>
                  <Icon name="information-outline" size={14} color={COLORS.INFO} />
                  <Text style={styles.label}>Usage Instructions</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                  {item.usageInstructions}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer: Dates */}
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Icon name="calendar-clock" size={12} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.dateText}>
              Suggested {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
          {item.isPurchased && (
            <View style={styles.dateRow}>
              <Icon name="check-circle" size={12} color={COLORS.SUCCESS} />
              <Text style={[styles.dateText, { color: COLORS.SUCCESS }]}>
                Purchased {new Date(item.purchaseDetails.purchasedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      {/* Header */}
      <LinearGradient colors={[COLORS.PRIMARY, '#4A3456']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Suggested Remedies</Text>
          <Text style={styles.headerSubtitle}>
            Order #{orderId.slice(-6)} • {userName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loaderText}>Loading remedies...</Text>
        </View>
      ) : (
        <FlatList
          data={remedies}
          keyExtractor={(item) => item.remedyId}
          renderItem={renderRemedy}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed" size={80} color={COLORS.BORDER} />
              <Text style={styles.emptyText}>No remedies suggested yet</Text>
              <Text style={styles.emptySubtext}>
                Suggested remedies will appear here
              </Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default AstrologerSuggestedRemediesScreen;
