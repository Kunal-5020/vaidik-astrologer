import { apiClient } from './axios.instance';
import { API_ENDPOINTS } from '../../config/api.config';
import { STORAGE_KEYS } from '../../config/constants';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';


class AstrologerAuthService {
  constructor() {
    this.fcmTokenRefreshListener = null;
  }

  /**
   * Helper: Extract error message from response
   */
  extractErrorMessage(error) {
    if (!error.response?.data) {
      return error.message || 'An error occurred';
    }

    const data = error.response.data;

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    if (typeof data.message === 'string') {
      return data.message;
    }

    return data.error || error.message || 'Authentication failed';
  }

  /**
   * Check if phone number has approved astrologer account
   */
  async checkPhone(data) {
    try {
      console.log('📤 [AstrologerAuth] Checking phone for astrologer account:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_CHECK_PHONE, data);
      
      console.log('✅ [AstrologerAuth] Check Phone Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerAuth] Check Phone Failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Send OTP for astrologer login
   */
  async sendLoginOtp(data) {
    try {
      console.log('📤 [AstrologerAuth] Sending Astrologer Login OTP:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_LOGIN, data);
      
      console.log('✅ [AstrologerAuth] Astrologer Login OTP Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerAuth] Astrologer Login OTP Failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * ✅ FIXED: Verify OTP and login astrologer (WITH CORRECT STORAGE KEYS)
   */
  async verifyLoginOtp(data) {
    try {
      console.log('📤 [AstrologerAuth] Verifying OTP with device info:', {
        phoneNumber: data.phoneNumber,
        otp: '****',
        fcmToken: data.fcmToken ? `${data.fcmToken.substring(0, 15)}...` : 'null',
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        deviceName: data.deviceName,
      });

      // ✅ CRITICAL: Send device info with OTP verification
      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_VERIFY_LOGIN, {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        otp: data.otp,
        fcmToken: data.fcmToken || 'unknown',
        deviceId: data.deviceId || 'unknown',
        deviceType: data.deviceType || 'phone',
        deviceName: data.deviceName || 'unknown',
      });
      
      console.log('✅ [AstrologerAuth] OTP verified successfully');
      
      if (!response.data?.data) {
        throw new Error('Invalid response structure from server');
      }

      const { tokens, user, astrologer } = response.data.data;

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('Server did not return authentication tokens');
      }

      // ✅ FIXED: Use STORAGE_KEYS constants (not plain strings!)
      console.log('💾 [AstrologerAuth] Saving tokens with correct storage keys...');
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.ASTROLOGER_DATA, JSON.stringify(astrologer)),
      ]);

      console.log('✅ [AstrologerAuth] All tokens and data saved successfully');

      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerAuth] OTP verification failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Refresh astrologer token
   */
  async refreshToken(refreshToken) {
    try {
      console.log('🔄 [AstrologerAuth] Refreshing astrologer token');

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_REFRESH_TOKEN, {
        refreshToken,
      });
      
      console.log('✅ [AstrologerAuth] Token refreshed successfully');
      
      // ✅ Save new access token with correct key
      if (response.data?.data?.accessToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerAuth] Token Refresh Failed:', error);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Logout astrologer (UNREGISTER DEVICE)
   */
  async logout() {
    try {
      console.log('🚪 [AstrologerAuth] Logging out astrologer');

      // Optionally unregister device from backend
      await apiClient.post(API_ENDPOINTS.ASTROLOGER_LOGOUT);
      
      // Clear local storage using STORAGE_KEYS
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);
      
      console.log('✅ [AstrologerAuth] Logout successful and tokens cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ [AstrologerAuth] Logout Failed:', error);
      throw error;
    }
  }

  /**
   * Get current astrologer info
   */
  async getCurrentAstrologer() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_ME);
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerAuth] Get Current Astrologer Failed:', error);
      throw error;
    }
  }

  /**
   * ✅ Setup FCM Token (GET & STORE) - WITH ACTIVITY DELAY
   */
  async setupFCMToken() {
    try {
      console.log('🎫 [AstrologerAuth] Getting FCM token...');
      
      // ✅ CRITICAL: Wait for Activity to attach (500ms is usually enough)
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('⏳ [AstrologerAuth] Activity attachment delay complete');
      
      // Step 1: Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('⚠️  [AstrologerAuth] Notification permission not granted');
        return null;
      }

      // Step 2: Get FCM token
      const token = await messaging().getToken();
      console.log('✅ [AstrologerAuth] FCM Token obtained:', token ? `${token.substring(0, 20)}...` : 'NULL');

      // Step 3: Store token with correct key
      if (token) {
        try {
          await AsyncStorage.setItem('fcmToken', token);
          console.log('💾 [AstrologerAuth] FCM token stored in AsyncStorage');
        } catch (storageError) {
          console.error('❌ [AstrologerAuth] Failed to store FCM token:', storageError);
        }
      }

      return token;
    } catch (error) {
      console.error('❌ [AstrologerAuth] Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * ✅ Setup FCM Token Refresh Listener
   */
  setupFCMTokenRefreshListener() {
    try {
      console.log('🔄 [AstrologerAuth] Setting up FCM refresh listener...');

      // Unsubscribe previous listener if exists
      if (this.fcmTokenRefreshListener) {
        this.fcmTokenRefreshListener();
      }

      this.fcmTokenRefreshListener = messaging().onTokenRefresh(async (newToken) => {
        console.log('🔄 [AstrologerAuth] FCM token refreshed:', `${newToken.substring(0, 20)}...`);
        
        try {
          await AsyncStorage.setItem('fcmToken', newToken);
          console.log('💾 [AstrologerAuth] New FCM token stored');
        } catch (error) {
          console.error('❌ [AstrologerAuth] Failed to store refreshed token:', error);
        }
      });

      console.log('✅ [AstrologerAuth] FCM refresh listener setup complete');
    } catch (error) {
      console.error('❌ [AstrologerAuth] Error setting up refresh listener:', error);
    }
  }

  /**
   * ✅ Cleanup (called on app unmount or logout)
   */
  cleanup() {
    try {
      console.log('🧹 [AstrologerAuth] Cleaning up FCM listeners...');
      
      if (this.fcmTokenRefreshListener) {
        this.fcmTokenRefreshListener();
        this.fcmTokenRefreshListener = null;
        console.log('✅ [AstrologerAuth] FCM refresh listener cleaned up');
      }
    } catch (error) {
      console.error('❌ [AstrologerAuth] Error during cleanup:', error);
    }
  }
}

// ✅ Export singleton instance
export const astrologerAuthService = new AstrologerAuthService();

export default astrologerAuthService;
