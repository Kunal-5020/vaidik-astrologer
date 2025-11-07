// src/contexts/AuthContext.js
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
      console.log('🔍 [AuthContext] Restoring auth from storage...');
      
      const [accessToken, user, astrologer] = await Promise.all([
        storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        storageService.getObject(STORAGE_KEYS.USER_DATA),
        storageService.getObject(STORAGE_KEYS.ASTROLOGER_DATA),
      ]);

      console.log('📊 [AuthContext] Restore check:', {
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        hasAstrologer: !!astrologer,
      });

      if (accessToken && user && astrologer) {
        dispatch({ 
          type: 'RESTORE_AUTH', 
          payload: { user, astrologer } 
        });
        console.log('✅ [AuthContext] Auth restored successfully');
      } else {
        console.log('ℹ️  [AuthContext] No complete auth data found - user needs to login');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Failed to restore auth:', error);
    }
  }, []);

  /**
   * Send OTP for astrologer login
   */
  const sendLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('📱 [AuthContext] Sending login OTP:', {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
      });

      const response = await astrologerAuthService.sendLoginOtp(data);

      if (response.success) {
        dispatch({ type: 'SET_PHONE', payload: data });
        dispatch({ type: 'OTP_SENT', payload: true });
        
        await storageService.setObject(STORAGE_KEYS.PHONE_NUMBER, data);
        console.log('✅ [AuthContext] OTP sent successfully');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('❌ [AuthContext] Send OTP error:', errorMessage);
      throw error;
    }
  }, []);

  /**
   * Verify OTP and login astrologer (FIXED - CORRECT RESPONSE STRUCTURE)
   */
  const verifyLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('🔐 [AuthContext] Verifying OTP...');

      const response = await astrologerAuthService.verifyLoginOtp(data);

      console.log('📊 [AuthContext] Verify response structure:', {
        success: response.success,
        hasData: !!response.data,
        hasTokens: !!response.data?.tokens,
        hasUser: !!response.data?.user,
        hasAstrologer: !!response.data?.astrologer,
      });

      if (response.success && response.data) {
        // ✅ FIXED: Correct destructuring based on actual response
        const { tokens, user, astrologer } = response.data;
        
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          throw new Error('Invalid token structure from server');
        }

        if (!user || !astrologer) {
          throw new Error('Missing user or astrologer data');
        }

        const { accessToken, refreshToken } = tokens;

        console.log('💾 [AuthContext] Saving login data to storage...');

        // ✅ Save tokens and user data
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          storageService.setObject(STORAGE_KEYS.USER_DATA, user),
          storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer),
        ]);

        console.log('✅ [AuthContext] All data saved successfully');

        // ✅ Update state
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, astrologer } 
        });

        console.log('✅ [AuthContext] Login successful:', {
          userId: user?._id,
          astrologerId: astrologer?._id,
        });
      } else {
        throw new Error('Invalid response structure from server');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Invalid OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ [AuthContext] Verify OTP error:', errorMessage);
      throw error;
    }
  }, []);

  /**
   * Logout astrologer
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 [AuthContext] Starting logout...');
      
      await astrologerAuthService.logout();
      
      console.log('💾 [AuthContext] Clearing stored data...');
      
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);
      
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [AuthContext] Logout complete');
    } catch (error) {
      console.error('❌ [AuthContext] Logout error:', error);
      // Still clear state even if API call fails
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
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
