// src/services/axios.instance.js (FIXED & ENHANCED)
import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { STORAGE_KEYS } from '../../config/constants';
import { storageService } from '../storage/storage.service';

let navigationRef = null; // Will be set from App.js

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

class ApiClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // ✅ REQUEST INTERCEPTOR - Add auth token to every request
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 [Axios] Token added to request:', {
              url: config.url,
              token: token.substring(0, 20) + '...',
            });
          } else {
            console.warn('⚠️  [Axios] No access token found for request:', config.url);
          }
        } catch (error) {
          console.error('❌ [Axios] Error adding token:', error);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ [Axios] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // ✅ RESPONSE INTERCEPTOR - Handle 401 and retry
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('✅ [Axios] Response success:', {
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        console.error('❌ [Axios] Response error:', {
          url: originalRequest?.url,
          status: error.response?.status,
          message: error.response?.data?.message,
          alreadyRetried: originalRequest?._retry,
        });

        // ✅ Handle 401 - Token expired (retry once)
        if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  console.log('🔄 [Axios] 401 Unauthorized - Attempting token refresh...');

  try {
    const refreshToken = await storageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      console.error('❌ [Axios] No refresh token available');
      await this.clearAuthAndLogout();
      return Promise.reject(error);
    }

    console.log('📝 [Axios] Refresh token found:', refreshToken.substring(0, 20) + '...');

    // ✅ FIXED: Use API_ENDPOINTS constant instead of hardcoded URL
    const refreshResponse = await axios.post(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASTROLOGER_REFRESH_TOKEN}`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ [Axios] Refresh response received:', {
      status: refreshResponse.status,
      hasAccessToken: !!refreshResponse.data?.data?.accessToken,
    });

    // ✅ Extract new token (handle both response formats)
    const newAccessToken = 
      refreshResponse.data?.data?.accessToken || 
      refreshResponse.data?.accessToken;

    if (!newAccessToken) {
      console.error('❌ [Axios] No access token in refresh response:', refreshResponse.data);
      await this.clearAuthAndLogout();
      return Promise.reject(new Error('No access token in refresh response'));
    }

    // ✅ Save new token with CORRECT key
    await storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    console.log('💾 [Axios] New token saved:', newAccessToken.substring(0, 20) + '...');

    // ✅ Retry original request with new token
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    console.log('🔄 [Axios] Retrying original request with new token...');
    
    return this.axiosInstance(originalRequest);
  } catch (refreshError) {
    console.error('❌ [Axios] Token refresh failed:', {
      message: refreshError.message,
      status: refreshError.response?.status,
      data: refreshError.response?.data,
    });

    // Clear auth and redirect to login
    await this.clearAuthAndLogout();
    return Promise.reject(refreshError);
  }
}

        // ✅ Handle 403 - Forbidden
        if (error.response?.status === 403) {
          console.error('❌ [Axios] 403 Forbidden:', error.response?.data?.message);
        }

        // ✅ Handle 404 - Not found
        if (error.response?.status === 404) {
          console.warn('⚠️  [Axios] 404 Not Found:', originalRequest?.url);
        }

        // ✅ Handle 500 - Server error
        if (error.response?.status >= 500) {
          console.error('❌ [Axios] Server error:', error.response?.data?.message);
        }

        // ✅ Handle network error
        if (!error.response) {
          console.error('❌ [Axios] Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // ✅ Clear auth and redirect to login
  async clearAuthAndLogout() {
    try {
      console.log('🧹 [Axios] Clearing authentication...');
      
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);

      console.log('✅ [Axios] Auth cleared');

      // Navigate to login
      if (navigationRef) {
        console.log('🔐 [Axios] Navigating to Login screen');
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('❌ [Axios] Error during logout:', error);
    }
  }

  getInstance() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient().getInstance();
