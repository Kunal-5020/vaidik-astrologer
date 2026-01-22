// src/screens/auth/PhoneNumberScreen.js

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Vibration,
  ScrollView,
  Linking,
} from 'react-native';
import { useRegistration } from '../../contexts';
import CountryCodePicker from '../../component/CountaryCodePickar';
import { styles } from '../../style/PhoneNumberStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

const countryRules = {
  IN: 10, US: 10, CA: 10, AU: 9, GB: 10, AE: 9, SA: 9, PK: 10, BD: 10,
  LK: 9, NP: 10, CN: 11, JP: 10, KR: 10, SG: 8, MY: 9, ID: 10, TH: 9,
  PH: 10, VN: 9, NG: 10, EG: 10, TR: 10, RU: 10, BR: 11, MX: 10, CL: 9,
  CO: 10, PE: 9, NZ: 9, DE: 11, FR: 9, IT: 9, ES: 9, NL: 9, CH: 9, SE: 9,
  NO: 8, DK: 8, FI: 9, IE: 9, PT: 9, PL: 9, GR: 10, IL: 9,
};


export default function PhoneNumberScreen({ navigation }) {
  const { sendOtp, state } = useRegistration();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });
  const [localError, setLocalError] = useState('');

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

  useEffect(() => {
    if (localError) setLocalError('');
  }, [phoneNumber, localError]);

  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
    setPhoneNumber('');
    setLocalError('');
    Vibration.vibrate(10);
  }, []);

  const handlePhoneChange = useCallback((text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
    if (cleaned) Vibration.vibrate(5);
  }, []);

  const formatErrorMessage = useCallback((error) => {
    if (!error) return 'An unknown error occurred';
    const errorData = error.response?.data;
    if (errorData) {
      if (Array.isArray(errorData.message)) return errorData.message.join('\n');
      if (typeof errorData.message === 'string') return errorData.message;
    }
    if (typeof error.message === 'string') return error.message;
    return 'Failed to send OTP. Please check your connection.';
  }, []);

  const handleSendOtp = useCallback(async () => {
    setLocalError('');
    if (!phoneNumber.trim()) {
      setLocalError('Please enter phone number');
      Alert.alert('Validation', 'Please enter phone number');
      return;
    }
    if (phoneNumber.length !== expectedLength) {
      const error = `Phone number must be ${expectedLength} digits for ${selectedCountry.name}`;
      setLocalError(error);
      Alert.alert('Invalid Number', error);
      return;
    }

    try {
      const formattedCountryCode = selectedCountry.dial_code.replace(/^\+/, '');
      await sendOtp({
        phoneNumber,
        countryCode: formattedCountryCode,
      });
      Vibration.vibrate(50);
      navigation.navigate('RegisterOTP', {
        phoneNumber,
        countryCode: formattedCountryCode,
      });
    } catch (error) {
      Vibration.vibrate([0, 100, 50, 100]);
      const errorMessage = formatErrorMessage(error);
      setLocalError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [phoneNumber, expectedLength, selectedCountry, sendOtp, navigation, formatErrorMessage]);

  const handleCheckStatus = useCallback(() => {
    Vibration.vibrate(10);
    navigation.navigate('CheckStatus');
  }, [navigation]);

  const handleBackToLogin = useCallback(() => {
    Vibration.vibrate(10);
    navigation.navigate('Login');
  }, [navigation]);

  // ✅ NEW: Terms Handlers
  const handleTermsPress = () => {
    Linking.openURL('https://vaidiktalk.com/terms-and-conditions');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://vaidiktalk.com/privacy-policy');
  };

  const displayError = localError || state.error;

  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.titleBold}>VaidikTalk</Text>
            <Text style={styles.subtitle}>Register as Astrologer</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number (मोबाइल नंबर)</Text>

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

            {phoneNumber.length > 0 && (
              <Text style={[styles.counterText, isPhoneValid && styles.counterTextValid]}>
                {phoneNumber.length}/{expectedLength} digits{isPhoneValid && ' ✓'}
              </Text>
            )}

            {displayError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {displayError}</Text>
              </View>
            ) : null}

            <Text style={styles.infoText}>
              We will send you an OTP for verification
            </Text>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isButtonDisabled}
              style={[styles.sendButton, isButtonDisabled && styles.sendButtonDisabled]}
              activeOpacity={0.8}
            >
              {state.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCheckStatus}
              style={styles.checkStatusButton}
              disabled={state.isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.checkStatusText, state.isLoading && styles.checkStatusTextDisabled]}>
                Already Registered? Check Status
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backButton}
              disabled={state.isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.backButtonText, state.isLoading && styles.backButtonTextDisabled]}>
                Back to Login
              </Text>
            </TouchableOpacity>

            {/* ✅ ADDED: Terms and Conditions Section */}
            <View style={styles.termsWrapper}>
              <Text style={styles.termsText}>By signing up, you agree to our </Text>
              <TouchableOpacity onPress={handleTermsPress}>
                <Text style={styles.link}>Terms of use</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity onPress={handlePrivacyPress}>
                <Text style={styles.link}>Privacy policy</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>.</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
