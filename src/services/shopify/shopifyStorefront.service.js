import Client from 'shopify-buy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOPIFY_DOMAIN = 'vaidik-talk.myshopify.com';
const STOREFRONT_TOKEN = '1e9539c27f94f0cbc117609a3e1587f2';
const CACHE_VERSION = 'v2';

class ShopifyStorefrontService {
  constructor() {
    this.client = Client.buildClient({
      domain: SHOPIFY_DOMAIN,
      storefrontAccessToken: STOREFRONT_TOKEN,
    });
  }

  async getCategories() {
    const cacheKey = `shopify_categories_${CACHE_VERSION}`;
    
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          console.log('📦 Categories from cache');
          return data;
        }
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }

    console.log('🔄 Fetching categories...');
    const collections = await this.client.collection.fetchAll();
    const formatted = collections.map(col => ({
      id: col.id,
      title: col.title,
      handle: col.handle,
      image: col.image?.src || null,
    }));

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: formatted,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.log('Cache write error:', error);
    }

    return formatted;
  }

  async getProductsByCollection(collectionId, limit = 20) {
    if (!this.client) {
      throw new Error('Shopify not configured');
    }

    const cacheKey = `shopify_products_${collectionId}_${CACHE_VERSION}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 6 * 60 * 60 * 1000) {
          console.log('📦 Products from cache');
          return data;
        }
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }

    // ✅ Use REST API (simpler, more reliable)
    console.log('🔄 Fetching products...');
    const collection = await this.client.collection.fetchWithProducts(
      collectionId,
      { productsFirst: limit }
    );
    
    const formatted = this.formatProducts(collection.products);

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: formatted,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.log('Cache write error:', error);
    }

    return formatted;
  }

  async getProduct(productId) {
    console.log('🔄 Fetching product...');
    const product = await this.client.product.fetch(productId);
    return this.formatProduct(product);
  }

  async createCheckout(items) {
    const lineItemsToAdd = items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const checkout = await this.client.checkout.create();
    const checkoutWithItems = await this.client.checkout.addLineItems(
      checkout.id,
      lineItemsToAdd
    );

    return {
      checkoutId: checkoutWithItems.id,
      webUrl: checkoutWithItems.webUrl,
      totalPrice: checkoutWithItems.totalPrice,
    };
  }

  formatProducts(products) {
    if (!Array.isArray(products)) {
      console.warn('⚠️ Products is not an array');
      return [];
    }
    return products.map(p => this.formatProduct(p)).filter(p => p !== null);
  }

  formatProduct(product) {
    if (!product) {
      console.warn('⚠️ Product is null');
      return null;
    }

    try {
      const images = Array.isArray(product.images) 
        ? product.images.map(img => img.src) 
        : [];
      
      const variants = Array.isArray(product.variants)
        ? product.variants.map(v => ({
            id: v.id,
            title: v.title,
            price: v.price?.amount || '0',
            currencyCode: v.price?.currencyCode || 'INR',
            available: v.available || false,
          }))
        : [];

      return {
        id: product.id,
        title: product.title || 'Unknown',
        description: product.description || '',
        images,
        variants,
        price: {
          min: variants[0]?.price || '0',
          max: variants[variants.length - 1]?.price || '0',
          currency: variants[0]?.currencyCode || 'INR',
        },
        vendor: product.vendor || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        availableForSale: product.availableForSale || false,
        rating: null, // Reviews not available via REST API
      };
    } catch (error) {
      console.error('❌ Format error:', error);
      return null;
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const shopifyKeys = keys.filter(key => key.startsWith('shopify_'));
      if (shopifyKeys.length > 0) {
        await AsyncStorage.multiRemove(shopifyKeys);
        console.log('🗑️ Cleared', shopifyKeys.length, 'items');
      }
    } catch (error) {
      console.log('Clear cache error:', error);
    }
  }
}

export default new ShopifyStorefrontService();
