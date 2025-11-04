import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { STORAGE_KEYS } from '../../config/constants';
import { storageService } from '../storage/storage.service';

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
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await storageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            
            if (refreshToken) {
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}/auth/refresh`,
                { refreshToken }
              );

              const { accessToken } = response.data.data;
              await storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout user
            await storageService.multiRemove([
              STORAGE_KEYS.ACCESS_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER_DATA,
            ]);
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getInstance() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient().getInstance();
