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
        astrologerData: astrologer ? {
          name: astrologer.name,
          email: astrologer.email,
          phone: astrologer.phoneNumber,
          experienceYears: astrologer.experienceYears,
          specializations: astrologer.specializations,
          languages: astrologer.languages,
        } : null,
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

      console.log('response',response);

      console.log('📊 [AuthContext] Verify response structure:', {
        success: response.success,
        hasData: !!response.data,
        hasTokens: !!response.data?.tokens,
        hasUser: !!response.data?.user,
        hasAstrologer: !!response.data?.astrologer,
      });

      if (response.success && response.data) {
        const { tokens, user, astrologer } = response.data;
        
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          throw new Error('Invalid token structure from server');
        }

        if (!user || !astrologer) {
          throw new Error('Missing user or astrologer data');
        }

        const { accessToken, refreshToken } = tokens;

        console.log('💾 [AuthContext] Saving login data to storage...', {
          astrologerData: {
            name: astrologer.name,
            email: astrologer.email,
            phone: astrologer.phoneNumber,
            experienceYears: astrologer.experienceYears,
            specializations: astrologer.specializations,
            languages: astrologer.languages,
          }
        });

        await Promise.all([
          storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          storageService.setObject(STORAGE_KEYS.USER_DATA, user),
          storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer),
        ]);

        console.log('✅ [AuthContext] All data saved successfully');

        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, astrologer } 
        });

        console.log('✅ [AuthContext] Login successful:', {
          userId: user?.id,
          astrologerId: astrologer?.id,
        });
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
      
      console.log('📊 [AuthContext] Truecaller response:', {
        success: response.success,
        hasData: !!response.data,
        canLogin: response.data?.canLogin,
        hasUser: !!response.data?.user,
        hasAstrologer: !!response.data?.astrologer,
      });

      if (response.success && response.data) {
        // Check if astrologer account exists
        if (response.data.canLogin === false) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return {
            success: true,
            data: {
              canLogin: false,
              message: response.data.message,
              isNewUser: true,
            }
          };
        }

        // Astrologer exists - proceed with login
        const { tokens, user, astrologer } = response.data;
        
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
          throw new Error('Invalid token structure from server');
        }

        if (!user || !astrologer) {
          throw new Error('Missing user or astrologer data from Truecaller response');
        }

        const { accessToken, refreshToken } = tokens;

        console.log('💾 [AuthContext] Saving Truecaller login data...');

        await Promise.all([
          storageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          storageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          storageService.setObject(STORAGE_KEYS.USER_DATA, user),
          storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, astrologer),
        ]);

        console.log('✅ [AuthContext] Truecaller data saved successfully');

        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, astrologer } 
        });

        console.log('✅ [AuthContext] Truecaller login successful:', {
          userId: user?.id,
          astrologerId: astrologer?.id,
          isNewUser: response.data?.isNewUser,
        });
      } else {
        throw new Error('Invalid response structure from server');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.formattedMessage || error.message || 'Truecaller login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ [AuthContext] Truecaller login error:', errorMessage);
      throw error;
    }
  }, []);

  /**
   * ✅ NEW: Update astrologer data in context and storage
   */
  const updateAstrologer = useCallback(async (updates) => {
    try {
      console.log('🔄 [AuthContext] Updating astrologer data:', updates);

      // Update context state
      dispatch({ 
        type: 'UPDATE_ASTROLOGER', 
        payload: updates 
      });

      // Get current astrologer data from storage
      const currentAstrologer = await storageService.getObject(STORAGE_KEYS.ASTROLOGER_DATA);
      
      if (currentAstrologer) {
        // Merge updates with current data
        const updatedAstrologer = {
          ...currentAstrologer,
          ...updates,
        };

        // Save back to storage
        await storageService.setObject(STORAGE_KEYS.ASTROLOGER_DATA, updatedAstrologer);
        
        console.log('✅ [AuthContext] Astrologer data updated:', {
          updatedFields: Object.keys(updates),
          newData: updatedAstrologer,
        });
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
      loginWithTruecaller,
      logout,
      restoreAuth,
      updateAstrologer, // ✅ Added
    }),
    [state, sendLoginOtp, verifyLoginOtp, loginWithTruecaller, logout, restoreAuth, updateAstrologer]
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
