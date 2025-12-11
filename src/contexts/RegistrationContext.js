  import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
  import { registrationService } from '../services/api/registration.service';
  import { storageService } from '../services/storage/storage.service';
  import { STORAGE_KEYS } from '../config/constants';

  // Initial state
  const initialState = {
    phoneNumber: null,
    countryCode: null,
    isOtpSent: false,
    isOtpVerified: false,
    isNewUser: null,     
    existingRegistration: null,
    registrationData: null,
    currentStep: 1,
    ticketNumber: null,
    isLoading: false,
    error: null,
  };

  // Reducer
  const registrationReducer = (state, action) => {
    switch (action.type) {
      case 'SET_PHONE':
        return {
          ...state,
          phoneNumber: action.payload.phoneNumber,
          countryCode: action.payload.countryCode,
        };
      case 'OTP_SENT':
        return { ...state, isOtpSent: action.payload };
      case 'OTP_VERIFIED':
        return {
          ...state,
          isOtpVerified: true,
          isNewUser: action.payload.isNewUser, 
          existingRegistration: action.payload.existingRegistration || null,
        };
      case 'SET_REGISTRATION_DATA':
        // ✅ FIX: Create a plain object without proxies
        const newData = JSON.parse(JSON.stringify(action.payload)); // Deep clone
        return {
          ...state,
          registrationData: newData,
        };
      case 'SET_STEP':
        return { ...state, currentStep: action.payload };
      case 'SET_TICKET_NUMBER':
        return { ...state, ticketNumber: action.payload };
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload, isLoading: false };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };

  // Create context
  const RegistrationContext = createContext(undefined);

  // Provider component
  export const RegistrationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(registrationReducer, initialState);
    const verifyOtpInProgress = useRef(false);

    /**
   * Helper: Get error message from error object
   */
  const getErrorMessage = (error) => {
    // Use formatted message if available
    if (error.formattedMessage) {
      return error.formattedMessage;
    }

    // Try response data
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle array messages
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      
      // Handle string message
      if (typeof data.message === 'string') {
        return data.message;
      }
      
      // Handle error field
      if (data.error) {
        return data.error;
      }
    }

    // Fallback to error message
    return error.message || 'An error occurred';
  };

    /**
   * Send OTP
   */
  const sendOtp = useCallback(async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await registrationService.sendOtp(data);

      if (response.success) {
        dispatch({ type: 'SET_PHONE', payload: data });
        dispatch({ type: 'OTP_SENT', payload: true });
        await storageService.setObject(STORAGE_KEYS.PHONE_NUMBER, data);
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = getErrorMessage(error); // ✅ Use helper
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Verify OTP
   */
  const verifyOtp = useCallback(async (data) => {
  if (verifyOtpInProgress.current) {
    console.log('⚠️ OTP verification already in progress');
    return;
  }

  try {
    verifyOtpInProgress.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const response = await registrationService.verifyOtp(data);

    if (response.success && response.data.isValid) {
      dispatch({
        type: 'OTP_VERIFIED',
        payload: {
          isNewUser: response.data.isNewUser,
          existingRegistration: response.data.existingRegistration,
        },
      });
      console.log('✅ OTP verified successfully', response);

      return response; // ✅ important
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    throw error;
  } finally {
    verifyOtpInProgress.current = false;
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}, []);



    /**
     * Save registration data (step by step)
     */
    const saveRegistrationData = useCallback(async (data) => {
      try {
        console.log('💾 Saving registration data:', data);
        console.log('📊 Current registrationData:', state.registrationData);

        // ✅ FIX: Create plain objects without proxies
        const currentData = state.registrationData ? JSON.parse(JSON.stringify(state.registrationData)) : {};
        const newData = JSON.parse(JSON.stringify(data));
        
        // Merge data
        const mergedData = {
          ...currentData,
          ...newData,
        };

        console.log('✅ Merged data:', mergedData);

        dispatch({ type: 'SET_REGISTRATION_DATA', payload: mergedData });
        
        await storageService.setObject(STORAGE_KEYS.REGISTRATION_DATA, mergedData);
        
        console.log('✅ Data saved to storage');
      } catch (error) {
        console.error('❌ Error saving registration data:', error);
        throw error;
      }
    }, [state.registrationData]);

/**
 * Submit final registration
 */
const submitRegistration = useCallback(async (overrideData = null) => { // ✅ Add parameter
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // ✅ Use provided data OR fall back to state
    const registrationData = overrideData || state.registrationData;

    if (!registrationData) {
      throw new Error('Missing registration data');
    }

    // ✅ Get phone from data or state
    let phoneNumber = registrationData.phoneNumber || state.phoneNumber;
    let countryCode = registrationData.countryCode || state.countryCode;

    // ✅ Fallback to storage if still missing
    if (!phoneNumber || !countryCode) {
      console.log('⚠️ Phone number not found, retrieving from storage...');
      const phoneData = await storageService.getObject(STORAGE_KEYS.PHONE_NUMBER);
      
      if (phoneData) {
        phoneNumber = phoneData.phoneNumber;
        countryCode = phoneData.countryCode;
        console.log('✅ Phone retrieved from storage:', { phoneNumber, countryCode });
      } else {
        throw new Error('Missing phone number or country code');
      }
    }

    // ✅ Create clean payload
    const payload = {
      phoneNumber: phoneNumber,
      countryCode: countryCode,
      name: registrationData.name || '',
      email: registrationData.email || '',
      dateOfBirth: registrationData.dateOfBirth || '',
      gender: registrationData.gender || '',
      bio: registrationData.bio || '',
      skills: Array.isArray(registrationData.skills) ? [...registrationData.skills] : [],
      languagesKnown: Array.isArray(registrationData.languagesKnown) ? [...registrationData.languagesKnown] : [],
      profilePicture: registrationData.profilePicture || null,
    };

    console.log('📤 Submitting payload:', JSON.stringify(payload, null, 2));

    const response = await registrationService.register(payload);

    if (response.success) {
      const ticketNumber = response.data.ticketNumber;
      dispatch({ type: 'SET_TICKET_NUMBER', payload: ticketNumber });
      await storageService.setItem(STORAGE_KEYS.TICKET_NUMBER, ticketNumber);
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return response;
  } catch (error) {
    console.error('❌ Registration Error:', error);
    console.log('📋 Error Response:', JSON.stringify(error.response?.data, null, 2));
    
    const errorMessage = getErrorMessage(error);
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    throw error;
  }
}, [state.phoneNumber, state.countryCode, state.registrationData]);




    /**
     * Check registration status
     */
    const checkStatus = useCallback(async (ticketNumber) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await registrationService.checkStatusByTicket(ticketNumber);
        dispatch({ type: 'SET_LOADING', payload: false });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to check status';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    }, []);

    /**
     * Set current step
     */
    const setStep = useCallback((step) => {
      dispatch({ type: 'SET_STEP', payload: step });
    }, []);

    /**
     * Reset state
     */
    const reset = useCallback(async () => {
      dispatch({ type: 'RESET' });
      await storageService.removeItem(STORAGE_KEYS.REGISTRATION_DATA);
      await storageService.removeItem(STORAGE_KEYS.PHONE_NUMBER);
    }, []);

    const value = useMemo(
      () => ({
        state,
        sendOtp,
        verifyOtp,
        saveRegistrationData,
        submitRegistration,
        checkStatus,
        setStep,
        reset,
      }),
      [state, sendOtp, verifyOtp, saveRegistrationData, submitRegistration, checkStatus, setStep, reset]
    );

    return (
      <RegistrationContext.Provider value={value}>
        {children}
      </RegistrationContext.Provider>
    );
  };

  // Custom hook
  export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) {
      throw new Error('useRegistration must be used within RegistrationProvider');
    }
    return context;
  };
