// src/screens/astrologer/SuggestRemediesScreen.js

import React, { useEffect, useState } from 'react';
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
import ScreenWrapper from '../../component/ScreenWrapper.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { styles, COLORS } from '../../style/SuggestRemediesStyle';
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

  const [selectedProducts, setSelectedProducts] = useState(new Map());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      const prods = await ShopifyStorefrontService.getProductsByCollection(category.id, 50);
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
        const numericId = extractNumericId(product.id);
        const firstVariant = product.variants?.[0];
        const numericVariantId = firstVariant ? extractNumericId(firstVariant.id) : null;

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

    const incomplete = items.filter(
      (i) => !i.recommendationReason?.trim() || i.recommendationReason.trim().length < 10
    );

    if (incomplete.length > 0) {
      Alert.alert(
        'Validation Error',
        `Recommendation reason must be at least 10 characters.\n\nPlease update ${incomplete.length} product(s).`,
        [
          { text: 'OK' },
          { text: 'Edit', onPress: () => setShowDetailsModal(true) },
        ]
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

      const res = await RemediesBackendService.suggestBulkRemedies(userId, orderId, payload);

      if (res && (res.success || res.data)) {
        Alert.alert('Success ✅', `${items.length} remedies suggested successfully!`, [
          { text: 'Done', onPress: () => navigation.goBack() },
        ]);
      } else {
        const msg = res.message || 'Failed to suggest remedies';
        Alert.alert('Error ❌', typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } catch (e) {
      console.log('handleSubmit error:', e);
      const errorMsg =
        e.response?.data?.message || e.message || 'Failed to suggest remedies. Please try again.';
      Alert.alert('Error ❌', Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => selectCategory(item)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <LinearGradient
            colors={['#FFC107', '#FFD54F']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
        <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]} numberOfLines={1}>
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
        activeOpacity={0.9}
      >
        {isSelected && (
          <View style={styles.checkBadge}>
            <Icon name="check-circle" size={24} color={COLORS.ACCENT} />
          </View>
        )}

        <Image
          source={imageUri ? { uri: imageUri } : require('../../assets/onlyLogoVaidik.png')}
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
            <View>
              <Text style={styles.modalTitle}>Add Recommendation Details</Text>
              <Text style={styles.modalSubtitle}>
                {items.length} product{items.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDetailsModal(false)}
              style={styles.modalCloseBtn}
            >
              <Icon name="close" size={24} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView 
            style={styles.modalScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {items.map(([productId, item], index) => (
              <View key={productId} style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Text style={styles.detailCardNumber}>{index + 1}</Text>
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

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Why recommend this? <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Explain why this remedy is beneficial..."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={item.recommendationReason}
                    onChangeText={(txt) =>
                      updateSelectedProductDetail(productId, 'recommendationReason', txt)
                    }
                    multiline
                    maxLength={300}
                  />
                  <Text style={styles.charCount}>
                    {item.recommendationReason?.length || 0}/300 (min 10 chars)
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Usage Instructions (Optional)</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="How should the user use this product..."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={item.usageInstructions}
                    onChangeText={(txt) =>
                      updateSelectedProductDetail(productId, 'usageInstructions', txt)
                    }
                    multiline
                    maxLength={300}
                  />
                  <Text style={styles.charCount}>{item.usageInstructions?.length || 0}/300</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="send" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Suggest {items.length} Remedies</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle}>Suggest Remedies</Text>
          <Text style={styles.headerSubtitle}>for {userName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loaderText}>Loading categories...</Text>
        </View>
      ) : (
        <>
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategory}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Products */}
          {loadingProducts ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loaderText}>Loading products...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={renderProduct}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="package-variant-closed" size={80} color={COLORS.BORDER} />
                  <Text style={styles.emptyText}>No products found</Text>
                  <Text style={styles.emptySubtext}>Try selecting a different category</Text>
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
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionCount}>{selectedProducts.size}</Text>
            </View>
            <Text style={styles.selectionText}>product{selectedProducts.size !== 1 ? 's' : ''} selected</Text>
          </View>
          <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => setSelectedProducts(new Map())} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setShowDetailsModal(true)}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Icon name="arrow-right" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderDetailsModal()}
    </ScreenWrapper>
  );
};

export default SuggestRemediesScreen;
