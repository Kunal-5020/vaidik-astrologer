import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  async setObject(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('Storage setObject error:', error);
      throw error;
    }
  }

  async getObject(key) {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage getObject error:', error);
      return null;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  async multiGet(keys) {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return [];
    }
  }

  async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Storage multiRemove error:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
