// src/screens/auth/PhoneNumberScreen.js

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Vibration,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistration } from '../../contexts';
import CountryCodePicker from '../../component/CountaryCodePickar';

const { width } = Dimensions.get('window');

// Country-specific phone length validation rules
const countryRules = {
  IN: 10, US: 10, CA: 10, AU: 9, GB: 10, AE: 9, SA: 9, PK: 10, BD: 10,
  LK: 9, NP: 10, CN: 11, JP: 10, KR: 10, SG: 8, MY: 9, ID: 10, TH: 9,
  PH: 10, VN: 9, NG: 10, EG: 10, TR: 10, RU: 10, BR: 11, MX: 10, CL: 9,
  CO: 10, PE: 9, NZ: 9, DE: 11, FR: 9, IT: 9, ES: 9, NL: 9, CH: 9, SE: 9,
  NO: 8, DK: 8, FI: 9, IE: 9, PT: 9, PL: 9, GR: 10, IL: 9,
};

const DEV_MODE = __DEV__;

export default function PhoneNumberScreen({ navigation }) {
  const { sendOtp, state } = useRegistration();

  // ===== STATE =====
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });
  const [localError, setLocalError] = useState('');

  // ===== MEMOIZED VALUES =====

  const expectedLength = useMemo(
    () => countryRules[selectedCountry.code] || 10,
    [selectedCountry.code]
  );

  const isPhoneValid = useMemo(
    () => phoneNumber.length === expectedLength,
    [phoneNumber.length, expectedLength]
  );

  const isButtonDisabled = useMemo(
    () => state.isLoading || !isPhoneValid || !phoneNumber.trim(),
    [state.isLoading, isPhoneValid, phoneNumber]
  );

  // ===== EFFECTS =====

  // Clear local error when phone number changes
  useEffect(() => {
    if (localError) setLocalError('');
  }, [phoneNumber, localError]);

  // ===== HANDLERS =====

  // Handle country selection
  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
    setPhoneNumber('');
    setLocalError('');
    Vibration.vibrate(10);
  }, []);

  // Handle phone number input
  const handlePhoneChange = useCallback((text) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);

    if (cleaned) Vibration.vibrate(5);
  }, []);

  // Format error messages
  const formatErrorMessage = useCallback((error) => {
    if (!error) return 'An unknown error occurred';

    // Check if error.response.data exists
    const errorData = error.response?.data;

    if (errorData) {
      // Case 1: message is an array of strings
      if (Array.isArray(errorData.message)) {
        return errorData.message.join('\n');
      }

      // Case 2: message is a string
      if (typeof errorData.message === 'string') {
        return errorData.message;
      }

      // Case 3: errors array (Laravel/NestJS validation format)
      if (Array.isArray(errorData.errors)) {
        return errorData.errors
          .map(err => {
            if (typeof err === 'string') return err;
            if (err.message) return err.message;
            return JSON.stringify(err);
          })
          .join('\n');
      }

      // Case 4: errors object with field-specific messages
      if (errorData.errors && typeof errorData.errors === 'object') {
        return Object.entries(errorData.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('\n');
      }
    }

    // Fallback to error.message
    if (typeof error.message === 'string') {
      return error.message;
    }

    // Last resort
    return 'Failed to send OTP. Please check your connection.';
  }, []);

  // Validate and send OTP
  const handleSendOtp = useCallback(async () => {
    // Clear previous errors
    setLocalError('');

    // Validation checks
    if (!phoneNumber.trim()) {
      const error = 'Please enter phone number';
      setLocalError(error);
      Vibration.vibrate([0, 50, 100, 50]);
      Alert.alert('Validation', error);
      return;
    }

    if (phoneNumber.length !== expectedLength) {
      const error = `Phone number must be ${expectedLength} digits for ${selectedCountry.name}`;
      setLocalError(error);
      Vibration.vibrate([0, 50, 100, 50]);
      Alert.alert('Invalid Number', error);
      return;
    }

    try {
      if (DEV_MODE) {
        console.log('🔵 Sending OTP for:', {
          phoneNumber,
          countryCode: selectedCountry.dial_code,
          country: selectedCountry.name,
        });
      }

      // Remove + prefix - backend expects digits only
      const formattedCountryCode = selectedCountry.dial_code.replace(/^\+/, '');

      if (DEV_MODE) {
        console.log('📤 Formatted country code:', formattedCountryCode);
      }

      await sendOtp({
        phoneNumber,
        countryCode: formattedCountryCode,
      });

      // Success haptic
      Vibration.vibrate(50);

      if (DEV_MODE) console.log('✅ OTP sent successfully');

      // Navigate to OTP screen with phone number
      navigation.navigate('RegisterOTP', {
        phoneNumber,
        countryCode: formattedCountryCode,
      });
    } catch (error) {
      // Error haptic
      Vibration.vibrate([0, 100, 50, 100]);

      if (DEV_MODE) {
        console.error('❌ OTP Error:', error);
        console.log('📋 Error Response:', error.response?.data);
      }

      const errorMessage = formatErrorMessage(error);

      setLocalError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [
    phoneNumber,
    expectedLength,
    selectedCountry,
    sendOtp,
    navigation,
    formatErrorMessage,
  ]);

  // Navigation handlers
  const handleCheckStatus = useCallback(() => {
    Vibration.vibrate(10);
    navigation.navigate('CheckStatus');
  }, [navigation]);

  const handleBackToLogin = useCallback(() => {
    Vibration.vibrate(10);
    navigation.navigate('Login');
  }, [navigation]);

  // Display error (local or from context)
  const displayError = localError || state.error;

  // ===== RENDER =====

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.titleBold}>VaidikTalk</Text>
            <Text style={styles.subtitle}>Register as Astrologer</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number (मोबाइल नंबर)</Text>

            {/* Country Code Picker + Phone Input */}
            <View style={styles.phoneContainer}>
              <CountryCodePicker onSelect={handleCountrySelect} />

              <TextInput
                style={styles.phoneInput}
                placeholder={`Enter ${expectedLength}-digit mobile number`}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={expectedLength}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                editable={!state.isLoading}
                autoFocus={false}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
            </View>

            {/* Character counter */}
            {phoneNumber.length > 0 && (
              <Text
                style={[
                  styles.counterText,
                  isPhoneValid && styles.counterTextValid,
                ]}
              >
                {phoneNumber.length}/{expectedLength} digits
                {isPhoneValid && ' ✓'}
              </Text>
            )}

            {/* Error message display */}
            {displayError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {displayError}</Text>
              </View>
            ) : null}

            <Text style={styles.infoText}>
              We will send you an OTP for verification
            </Text>

            {/* Send OTP Button */}
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isButtonDisabled}
              style={[
                styles.sendButton,
                isButtonDisabled && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {state.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            {/* Check Status Button */}
            <TouchableOpacity
              onPress={handleCheckStatus}
              style={styles.checkStatusButton}
              disabled={state.isLoading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.checkStatusText,
                  state.isLoading && styles.checkStatusTextDisabled,
                ]}
              >
                Already Registered? Check Status
              </Text>
            </TouchableOpacity>

            {/* Back to Login Button */}
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backButton}
              disabled={state.isLoading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.backButtonText,
                  state.isLoading && styles.backButtonTextDisabled,
                ]}
              >
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===== STYLES =====

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: '#333',
    fontWeight: '400',
  },
  titleBold: {
    fontSize: 34,
    color: '#5b2b84',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    color: '#111',
  },
  counterText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  counterTextValid: {
    color: '#4caf50',
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#5b2b84',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5b2b84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkStatusButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  checkStatusText: {
    color: '#5b2b84',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  checkStatusTextDisabled: {
    color: '#d1d5db',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonTextDisabled: {
    color: '#d1d5db',
  },
});
