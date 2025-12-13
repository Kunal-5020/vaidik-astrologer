// src/services/auth/astrologer-auth.service.js
import { apiClient } from './axios.instance';
import { API_ENDPOINTS } from '../../config/api.config';
import { STORAGE_KEYS } from '../../config/constants';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

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
   * Get device information for registration
   */
  async getDeviceInfo() {
    try {
      const [fcmToken, deviceId, deviceName] = await Promise.all([
        AsyncStorage.getItem('fcmToken'),
        DeviceInfo.getUniqueId(),
        DeviceInfo.getDeviceName(),
      ]);

      return {
        fcmToken: fcmToken || 'unknown',
        deviceId: deviceId || 'unknown',
        deviceType: 'phone',
        deviceName: deviceName || 'unknown',
      };
    } catch (error) {
      console.error('❌ [AstrologerAuth] Failed to get device info:', error);
      return {
        fcmToken: 'unknown',
        deviceId: 'unknown',
        deviceType: 'phone',
        deviceName: 'unknown',
      };
    }
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
   * ✅ FIXED: Verify OTP and login astrologer
   */
  async verifyLoginOtp(data) {
    try {
      // Get device info
      const deviceInfo = await this.getDeviceInfo();

      console.log('📤 [AstrologerAuth] Verifying OTP with device info:', {
        phoneNumber: data.phoneNumber,
        otp: '****',
        fcmToken: deviceInfo.fcmToken ? `${deviceInfo.fcmToken.substring(0, 15)}...` : 'null',
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
      });

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_VERIFY_LOGIN, {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        otp: data.otp,
        ...deviceInfo,
      });
      
      console.log('✅ [AstrologerAuth] OTP verified successfully');
      
      if (!response.data?.data) {
        throw new Error('Invalid response structure from server');
      }

      const { tokens, astrologer } = response.data.data;

      if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error('Server did not return authentication tokens');
      }

      if (!astrologer) {
        throw new Error('Server did not return user or astrologer data');
      }

      console.log('💾 [AstrologerAuth] Saving tokens with correct storage keys...');
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
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
   * ✅ FIXED: Verify Truecaller OAuth
   */
  async verifyTruecaller(truecallerData) {
    try {
      // Get device info
      const deviceInfo = await this.getDeviceInfo();

      console.log('📤 [AstrologerAuth] Logging in with Truecaller:', {
        authorizationCode: truecallerData.authorizationCode ? 'present' : 'missing',
        codeVerifier: truecallerData.codeVerifier ? 'present' : 'missing',
        fcmToken: deviceInfo.fcmToken ? `${deviceInfo.fcmToken.substring(0, 15)}...` : 'null',
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
      });

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_TRUECALLER_LOGIN, {
        authorizationCode: truecallerData.authorizationCode,
        codeVerifier: truecallerData.codeVerifier,
        ...deviceInfo,
      });

      console.log('📥 [AstrologerAuth] Truecaller response:', {
        success: response.data.success,
        canLogin: response.data.data?.canLogin,
        hasTokens: !!response.data.data?.tokens,
        hasAstrologer: !!response.data.data?.astrologer,
      });

      if (response.data.success) {
        // Check if astrologer account exists
        if (response.data.data.canLogin === false) {
          // No astrologer account
          console.log('⚠️ [AstrologerAuth] No astrologer account found');
          return response.data;
        }

        // Astrologer exists - save tokens
        const { tokens, astrologer } = response.data.data;

        if (!tokens?.accessToken || !tokens?.refreshToken) {
          throw new Error('Server did not return authentication tokens');
        }

        if (!astrologer) {
          throw new Error('Server did not return user or astrologer data');
        }
      
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.ASTROLOGER_DATA, JSON.stringify(astrologer)),
        ]);

        console.log('✅ [AstrologerAuth] Truecaller login data saved');

        return response.data;
      } else {
        throw new Error('Truecaller login failed');
      }
    } catch (error) {
      console.error('❌ [AstrologerAuth] Truecaller Login Failed:', error.response?.data);
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
   * Logout astrologer
   */
  async logout() {
    try {
      console.log('🚪 [AstrologerAuth] Logging out astrologer');

      // Get device ID before logout
      const deviceId = await DeviceInfo.getUniqueId();

      await apiClient.post(API_ENDPOINTS.ASTROLOGER_LOGOUT, {
        deviceId,
      });
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
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
   * ✅ Setup FCM Token - WITH ACTIVITY DELAY
   */
  async setupFCMToken() {
    try {
      console.log('🎫 [AstrologerAuth] Getting FCM token...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('⏳ [AstrologerAuth] Activity attachment delay complete');
      
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('⚠️  [AstrologerAuth] Notification permission not granted');
        return null;
      }

      // ✅ ADDED: Register for remote messages on iOS before getting token
      if (Platform.OS === 'ios') {
        console.log('🍎 [AstrologerAuth] Registering device for remote messages (iOS)...');
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      console.log('✅ [AstrologerAuth] FCM Token obtained:', token ? `${token.substring(0, 20)}...` : 'NULL');

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
   * ✅ Cleanup
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

  /**
 * ✅ NEW: Get fresh astrologer profile from API
 */
async fetchFreshProfile() {
  try {
    console.log('🔄 [AstrologerAuth] Fetching fresh astrologer profile...');
    
    const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_ME);
    
    console.log('📥 [AstrologerAuth] Fresh profile response received:', response.data);

    if (response.data?.success) {
      const { astrologer } = response.data.data;
      
      console.log('✅ [AstrologerAuth] Fresh profile fetched:', {
        astrologerName: astrologer?.name,
        experienceYears: astrologer?.experienceYears,
        specializations: astrologer?.specializations?.length,
        languages: astrologer?.languages?.length,
      });
      
      // Update AsyncStorage with fresh data
        AsyncStorage.setItem(STORAGE_KEYS.ASTROLOGER_DATA, JSON.stringify(astrologer));
      
      console.log('💾 [AstrologerAuth] Fresh profile saved to storage');
      
      return { success: true, astrologer };
    }
    
    throw new Error('Invalid profile response from server');
  } catch (error) {
    console.error('❌ [AstrologerAuth] Failed to fetch fresh profile:', error);
    
    // If API fails, return cached data as fallback
      AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
    
    if ( cachedAstrologer) {
      console.log('⚠️  [AstrologerAuth] Using cached profile data as fallback');
      return {
        success: true,
        astrologer: JSON.parse(cachedAstrologer),
        isCached: true,
      };
    }
    
    throw error;
  }
}

}

export const astrologerAuthService = new AstrologerAuthService();
export default astrologerAuthService;
