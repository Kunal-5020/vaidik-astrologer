import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { astrologerAuthService } from '../services';
import { storageService } from '../services/storage/storage.service';
import { STORAGE_KEYS } from '../config/constants';

const initialState = {
  isAuthenticated: false,
  user: null,
  astrologer: null,
  phoneNumber: null,
  countryCode: null,
  isOtpSent: false,
  isLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PHONE':
      return {
        ...state,
        phoneNumber: action.payload.phoneNumber,
        countryCode: action.payload.countryCode,
      };
    case 'OTP_SENT':
      return { ...state, isOtpSent: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        astrologer: action.payload.astrologer,
      };
    case 'RESTORE_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        astrologer: action.payload.astrologer,
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restore authentication on app launch
   */
  useEffect(() => {
    restoreAuth();
  }, []);

  const restoreAuth = useCallback(async () => {
    try {
      const [accessToken, user, astrologer] = await Promise.all([
        storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        storageService.getObject(STORAGE_KEYS.USER_DATA),
        storageService.getObject(STORAGE_KEYS.ASTROLOGER_DATA),
      ]);

      if (accessToken && user && astrologer) {
        dispatch({ 
          type: 'RESTORE_AUTH', 
          payload: { user, astrologer } 
        });
        console.log('✅ Auth restored from storage');
      }
    } catch (error) {
      console.error('❌ Failed to restore auth:', error);
    }
  }, []);

  /**
   * Send OTP for astrologer login
   */
  const sendLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await astrologerAuthService.sendLoginOtp(data);

      if (response.success) {
        dispatch({ type: 'SET_PHONE', payload: data });
        dispatch({ type: 'OTP_SENT', payload: true });
        
        // Save phone for later
        await storageService.setObject(STORAGE_KEYS.PHONE_NUMBER, data);
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Verify OTP and login astrologer
   */
  const verifyLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await astrologerAuthService.verifyLoginOtp(data);

      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data.tokens;
        const { user, astrologer } = response.data;

        // Save tokens
        await storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await storageService.setObject(STORAGE_KEYS.USER_DATA, user);
        await storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer);

        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, astrologer } 
        });

        console.log('✅ Astrologer login successful:', user, astrologer);
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Invalid OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Logout astrologer
   */
  const logout = useCallback(async () => {
    try {
      await astrologerAuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
      ]);
      
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const value = useMemo(
    () => ({
      state,
      sendLoginOtp,
      verifyLoginOtp,
      logout,
    }),
    [state, sendLoginOtp, verifyLoginOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
