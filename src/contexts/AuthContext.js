// src/contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { astrologerAuthService } from '../services';
import { storageService } from '../services/storage/storage.service';
import { STORAGE_KEYS } from '../config/constants';

const initialState = {
  isAuthenticated: false,
  astrologer: null,
  user: null,
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
        isLoading: false,
        error: null,
      };
    case 'RESTORE_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        astrologer: action.payload.astrologer,
      };
    case 'UPDATE_ASTROLOGER':
      return {
        ...state,
        astrologer: {
          ...state.astrologer,
          ...action.payload,
        },
      };
    case 'LOGOUT':
      return initialState;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
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

  /**
   * Restore authentication with fresh profile fetch
   */
  const restoreAuth = useCallback(async () => {
    try {
      console.log('🔍 [AuthContext] Restoring auth from storage...');

      const accessToken = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        console.log('ℹ️  [AuthContext] No access token - user needs to login');
        return { isAuthenticated: false };
      }

      console.log('✅ [AuthContext] Access token found - fetching fresh profile...');

      try {
        // Fetch fresh profile from API
        const profileResponse = await astrologerAuthService.fetchFreshProfile();

        if (profileResponse.success) {
          const { astrologer, isCached } = profileResponse;

          dispatch({
            type: 'RESTORE_AUTH',
            payload: { astrologer },
          });

          console.log('✅ [AuthContext] Auth restored with fresh profile', {
            astrologerId: astrologer?.id,
            isCached: isCached || false,
            experienceYears: astrologer?.experienceYears,
            specializations: astrologer?.specializations?.length,
          });

          return { isAuthenticated: true, astrologer };
        }
      } catch (apiError) {
        console.error('❌ [AuthContext] API fetch failed, trying cached data:', apiError);

        // Fallback to cached data if API fails
        // ✅ FIX: Added user fetch here to prevent crash in next step
        const [user, astrologer] = await Promise.all([
          storageService.getObject(STORAGE_KEYS.USER_DATA),
          storageService.getObject(STORAGE_KEYS.ASTROLOGER_DATA),
        ]);

        if (user && astrologer) {
          dispatch({
            type: 'RESTORE_AUTH',
            payload: { user, astrologer },
          });

          console.log('⚠️  [AuthContext] Auth restored with cached data');
          return { isAuthenticated: true, user, astrologer, isCached: true };
        }

        // If both API and cache fail, logout
        console.error('❌ [AuthContext] No valid auth data - clearing session');
        await storageService.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.ASTROLOGER_DATA,
        ]);
        return { isAuthenticated: false };
      }
    } catch (error) {
      console.error('❌ [AuthContext] Failed to restore auth:', error);
      return { isAuthenticated: false };
    }
  }, []);

  /**
   * Send OTP for astrologer login
   */
  const sendLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

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
   * Verify OTP and login astrologer
   */
  const verifyLoginOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('🔐 [AuthContext] Verifying OTP...');

      const response = await astrologerAuthService.verifyLoginOtp(data);

      if (response.success && response.data) {
        const { tokens, astrologer } = response.data;

        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          throw new Error('Invalid token structure from server');
        }

        const { accessToken, refreshToken } = tokens;

        console.log('💾 [AuthContext] Saving login data to storage...');

        await Promise.all([
          storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer),
        ]);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { astrologer },
        });

        console.log('✅ [AuthContext] Login successful');
      } else {
        throw new Error('Invalid response structure from server');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Invalid OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('❌ [AuthContext] Verify OTP error:', errorMessage);
      throw error;
    }
  }, []);

  /**
   * Truecaller login
   */
  const loginWithTruecaller = useCallback(async (truecallerData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('📱 [AuthContext] Logging in with Truecaller...');

      const response = await astrologerAuthService.verifyTruecaller(truecallerData);

      if (response.success && response.data) {
        if (response.data.canLogin === false) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return {
            success: true,
            data: {
              canLogin: false,
              message: response.data.message,
              isNewUser: true,
            },
          };
        }

        const { tokens, astrologer } = response.data;

        const { accessToken, refreshToken } = tokens;

        await Promise.all([
          storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer),
        ]);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { astrologer },
        });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Truecaller login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  /**
   * Update astrologer data in context and storage
   */
  const updateAstrologer = useCallback(async (updates) => {
    try {
      console.log('🔄 [AuthContext] Updating astrologer data:', updates);

      dispatch({
        type: 'UPDATE_ASTROLOGER',
        payload: updates,
      });

      const currentAstrologer = await storageService.getObject(STORAGE_KEYS.ASTROLOGER_DATA);

      if (currentAstrologer) {
        const updatedAstrologer = {
          ...currentAstrologer,
          ...updates,
        };

        await storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, updatedAstrologer);
      }
    } catch (error) {
      console.error('❌ [AuthContext] Failed to update astrologer:', error);
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
      await storageService.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ASTROLOGER_DATA,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('❌ [AuthContext] Logout error:', error);
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

  /**
   * ✅ NEW: Get current Astrologer data
   * Returns the astrologer object directly
   */
  const getAstrologer = useCallback(() => {
    return state.astrologer;
  }, [state.astrologer]);

  const value = useMemo(
    () => ({
      state,
      astrologer: state.astrologer, // ✅ Exposed as a direct variable
      getAstrologer,                // ✅ Exposed as a function
      sendLoginOtp,
      verifyLoginOtp,
      loginWithTruecaller,
      logout,
      restoreAuth,
      updateAstrologer,
    }),
    [
      state,
      getAstrologer,
      sendLoginOtp,
      verifyLoginOtp,
      loginWithTruecaller,
      logout,
      restoreAuth,
      updateAstrologer,
    ]
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