// src/services/api/axios.instance.js
import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { STORAGE_KEYS } from '../../config/constants';
import { storageService } from '../storage/storage.service';

let navigationRef = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// ✅ Queue to handle multiple requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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
    // REQUEST INTERCEPTOR
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('❌ [Axios] Error adding token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // ✅ Handle 401 Unauthorized (Token Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log('🔄 [Axios] 401 Detected. Attempting token refresh...');
            const refreshToken = await storageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // ✅ Call Refresh Endpoint
            // Note: Updated endpoint path. Ensure this matches your backend.
            const refreshResponse = await axios.post(
              `${API_CONFIG.BASE_URL}/auth/refresh`, 
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const newAccessToken = 
              refreshResponse.data?.data?.accessToken || 
              refreshResponse.data?.accessToken;

            if (!newAccessToken) {
              throw new Error('No access token in refresh response');
            }

            // ✅ Save new token
            await storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            
            // ✅ Update headers and retry
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Process queued requests
            processQueue(null, newAccessToken);
            isRefreshing = false;

            return this.axiosInstance(originalRequest);

          } catch (refreshError) {
            console.error('❌ [Axios] Token refresh failed:', refreshError.message);
            
            processQueue(refreshError, null);
            isRefreshing = false;
            
            await this.clearAuthAndLogout();
            return Promise.reject(new Error('Session expired. Please login again.'));
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async clearAuthAndLogout() {
    try {
      console.log('🧹 [Axios] Clearing session and logging out...');
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);
      
      if (navigationRef) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  getInstance() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient().getInstance();