// src/services/storage/storage.service.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async setItem(key, value) {
    try {
      console.log(`💾 [Storage] Setting ${key}`);
      await AsyncStorage.setItem(key, value);
      console.log(`✅ [Storage] Set ${key} successfully`);
    } catch (error) {
      console.error('❌ Storage setItem error:', error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log(`✅ [Storage] Got ${key}:`, value ? `${value.substring(0, 20)}...` : 'null');
      return value;
    } catch (error) {
      console.error('❌ Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      console.log(`🗑️  [Storage] Removing ${key}`);
      await AsyncStorage.removeItem(key);
      console.log(`✅ [Storage] Removed ${key}`);
    } catch (error) {
      console.error('❌ Storage removeItem error:', error);
      throw error;
    }
  }

  async setObject(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      console.log(`💾 [Storage] Setting object ${key}`);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('❌ Storage setObject error:', error);
      throw error;
    }
  }

  async getObject(key) {
    try {
      const jsonValue = await this.getItem(key);
      if (jsonValue != null) {
        const parsed = JSON.parse(jsonValue);
        console.log(`✅ [Storage] Got object ${key}`);
        return parsed;
      }
      console.log(`ℹ️  [Storage] Object ${key} is null`);
      return null;
    } catch (error) {
      console.error('❌ Storage getObject error:', error);
      return null;
    }
  }

  async clear() {
    try {
      console.log('🧹 [Storage] Clearing all storage');
      await AsyncStorage.clear();
      console.log('✅ [Storage] Storage cleared');
    } catch (error) {
      console.error('❌ Storage clear error:', error);
      throw error;
    }
  }

  async multiGet(keys) {
    try {
      const values = await AsyncStorage.multiGet(keys);
      console.log(`✅ [Storage] Got ${keys.length} items`);
      return values;
    } catch (error) {
      console.error('❌ Storage multiGet error:', error);
      return [];
    }
  }

  async multiRemove(keys) {
    try {
      console.log(`🗑️  [Storage] Removing ${keys.length} items`);
      await AsyncStorage.multiRemove(keys);
      console.log(`✅ [Storage] Removed ${keys.length} items`);
    } catch (error) {
      console.error('❌ Storage multiRemove error:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
