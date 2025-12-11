// src/screens/astrologer/SuggestRemediesScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ShopifyStorefrontService from '../../services/shopify/shopifyStorefront.service.js';
import RemediesBackendService from '../../services/shopify/remediesBackend.service.js';

const SuggestRemediesScreen = ({ navigation, route }) => {
  const { userId, orderId, userName, sessionType = 'chat' } = route.params;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedProducts, setSelectedProducts] = useState(new Map());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await ShopifyStorefrontService.getCategories();
      setCategories(cats || []);
      if (cats?.length > 0) {
        selectCategory(cats[0]);
      }
    } catch (e) {
      console.log('loadCategories error:', e);
      Alert.alert('Error', 'Failed to load product categories');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = async (category) => {
    setSelectedCategory(category);
    setLoadingProducts(true);
    try {
      const prods = await ShopifyStorefrontService.getProductsByCollection(
        category.id,
        50,
      );
      setProducts(prods || []);
    } catch (e) {
      console.log('selectCategory error:', e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(product.id)) {
        newMap.delete(product.id);
      } else {
        // Extract numeric product ID from Shopify GraphQL ID
        const numericId = extractNumericId(product.id);
        const firstVariant = product.variants?.[0];
        const numericVariantId = firstVariant
          ? extractNumericId(firstVariant.id)
          : null;

        newMap.set(product.id, {
          shopifyProductId: numericId,
          shopifyVariantId: numericVariantId,
          productName: product.title,
          imageUrl: product.images?.[0] || null,
          price: firstVariant?.price || '0',
          recommendationReason: '',
          usageInstructions: '',
          suggestedInChannel: sessionType === 'chat' ? 'chat' : 'call',
        });
      }
      return newMap;
    });
  };

  // Extract numeric ID from Shopify GraphQL ID
  const extractNumericId = (gid) => {
    if (!gid) return null;
    const match = gid.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const updateSelectedProductDetail = (productId, field, value) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      const item = newMap.get(productId);
      if (item) {
        item[field] = value;
        newMap.set(productId, item);
      }
      return newMap;
    });
  };

  const handleSubmit = async () => {
    const items = Array.from(selectedProducts.values());

    // ✅ FIXED: Check for trimmed empty strings
    const incomplete = items.filter((i) => !i.recommendationReason?.trim());
    if (incomplete.length > 0) {
      Alert.alert(
        'Incomplete',
        `Please add recommendation reason for ${incomplete.length} product${incomplete.length > 1 ? 's' : ''}`,
        [
          { text: 'OK' },
          {
            text: 'Go Back to Edit',
            onPress: () => setShowDetailsModal(true),
          },
        ],
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = items.map((item) => ({
        shopifyProductId: item.shopifyProductId,
        shopifyVariantId: item.shopifyVariantId,
        recommendationReason: item.recommendationReason,
        usageInstructions: item.usageInstructions || '',
        suggestedInChannel: item.suggestedInChannel,
      }));

      const res = await RemediesBackendService.suggestBulkRemedies(
        userId,
        orderId,
        payload,
      );

      if (res.success) {
        Alert.alert(
          'Success ✅',
          `${items.length} remedies suggested successfully!`,
          [{ text: 'Done', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert('Error ❌', res.message || 'Failed to suggest remedies');
      }
    } catch (e) {
      console.log('handleSubmit error:', e);
      Alert.alert('Error ❌', 'Failed to suggest remedies. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => selectCategory(item)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }) => {
    const isSelected = selectedProducts.has(item.id);
    const imageUri = item.images?.[0] || null;

    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        onPress={() => toggleProductSelection(item)}
      >
        {isSelected && (
          <View style={styles.checkBadge}>
            <Icon name="check" size={16} color="#FFF" />
          </View>
        )}

        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require('../../assets/onlyLogoVaidik.png')
          }
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>₹{item.price.min}</Text>
        </View>
      </TouchableOpacity>
    );
  };

const renderDetailsModal = () => {
  const items = Array.from(selectedProducts.entries());

  if (!showDetailsModal) return null;

  return (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add Details ({items.length} product{items.length !== 1 ? 's' : ''})
            </Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Body: products + text fields */}
          <ScrollView style={styles.modalScroll}>
            {items.map(([productId, item]) => (
              <View key={productId} style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require('../../assets/onlyLogoVaidik.png')
                    }
                    style={styles.detailImage}
                  />
                  <View style={styles.detailHeaderText}>
                    <Text style={styles.detailProductName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <Text style={styles.detailPrice}>₹{item.price}</Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>
                  Recommendation Reason <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Why are you suggesting this product?"
                  value={item.recommendationReason}
                  onChangeText={(txt) =>
                    updateSelectedProductDetail(
                      productId,
                      'recommendationReason',
                      txt,
                    )
                  }
                  multiline
                  maxLength={300}
                />

                <Text style={styles.fieldLabel}>
                  Usage Instructions (optional)
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="How to use this product..."
                  value={item.usageInstructions}
                  onChangeText={(txt) =>
                    updateSelectedProductDetail(
                      productId,
                      'usageInstructions',
                      txt,
                    )
                  }
                  multiline
                  maxLength={300}
                />
              </View>
            ))}
          </ScrollView>

          {/* Footer: submit button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              submitting && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                Suggest {items.length} Remedies →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle}>Suggest Remedies</Text>
          <Text style={styles.headerSubtitle}>for {userName}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon
          name="magnify"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />

          {/* Products */}
          {loadingProducts ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={renderProduct}
              numColumns={2}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="package-variant" size={64} color="#ddd" />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* Selection Footer */}
      {selectedProducts.size > 0 && (
        <View style={styles.selectionFooter}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>
              {selectedProducts.size} selected
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedProducts(new Map())}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setShowDetailsModal(true)}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Icon name="arrow-right" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {renderDetailsModal()}
    </SafeAreaView>
  );
};

export default SuggestRemediesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C1317' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2C34',
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#8696A0', marginTop: 2 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#E9EDEF',
  },

  categoriesList: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10, // ✅ FIXED: Reduced padding
    borderRadius: 20,
    backgroundColor: '#1F2C34',
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
  },
  categoryText: { 
    fontSize: 14,
    fontWeight: '600', 
    color: '#E9EDEF',
  },
  categoryTextActive: { color: '#000' },

  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  productCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#1F2C34',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '48%',
    position: 'relative',
  },
  productCardSelected: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#2A3942',
  },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E9EDEF',
    marginBottom: 4,
  },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#FFD700' },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8696A0',
    marginTop: 12,
  },

  selectionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2C34',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A3942',
  },
  selectionInfo: { flexDirection: 'row', alignItems: 'center' },
  selectionCount: { fontSize: 15, fontWeight: '600', color: '#E9EDEF' },
  clearText: {
    fontSize: 13,
    color: '#FF6B6B',
    marginLeft: 12,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#000', marginRight: 6 },

  // Modal ✅ FIXED: All styles properly organized
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  modalScroll: { flex: 1, paddingHorizontal: 16 },

  detailCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailHeader: { flexDirection: 'row', marginBottom: 12 },
  detailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  detailHeaderText: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  detailProductName: { fontSize: 14, fontWeight: '600', color: '#000' },
  detailPrice: { fontSize: 13, fontWeight: '700', color: '#FFD700', marginTop: 4 },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  fieldLabelError: {
    color: '#EF4444',
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#000',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  textAreaError: {
    borderColor: '#EF4444',
  },

  submitBtn: {
    backgroundColor: '#FFD700',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: '#FFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '90%',      // so body + fields are visible
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
modalScroll: {
  maxHeight: '70%',       // body area
  paddingHorizontal: 16,
},
detailCard: {
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
});
