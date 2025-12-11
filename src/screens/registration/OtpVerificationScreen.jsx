import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INITIAL_TIMER = 30;
const OTP_LENGTH = 6;
const DEV_MODE = __DEV__; // Only log in development

export default function OtpVerificationScreen({ navigation }) {
  const { verifyOtp, sendOtp, state } = useRegistration();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const inputRefs = useRef([]);
  const verificationAttempted = useRef(false);
  const timerRef = useRef(null);

  // Memoized values to prevent unnecessary re-renders
  const otpComplete = useMemo(() => otp.every(digit => digit !== ''), [otp]);
  const otpCode = useMemo(() => otp.join(''), [otp]);
  const canResend = useMemo(() => timer === 0, [timer]);
  const isButtonDisabled = useMemo(() => isVerifying || !otpComplete, [isVerifying, otpComplete]);

  // Optimized timer with cleanup
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(prev => prev - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpComplete && !isVerifying && !verificationAttempted.current) {
      // Small delay for better UX
      const autoVerifyTimer = setTimeout(() => {
        handleVerifyOtp();
      }, 300);
      return () => clearTimeout(autoVerifyTimer);
    }
  }, [otpComplete, isVerifying]);

  // Optimized OTP change handler with useCallback
  const handleOtpChange = useCallback((value, index) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Haptic feedback on input
    if (value) Vibration.vibrate(10);
  }, []);

  // Optimized backspace handler
  const handleKeyPress = useCallback((e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      Vibration.vibrate(10);
    }
  }, [otp]);

  // Save existing ticket to AsyncStorage
  const saveExistingTicket = useCallback(async (ticketNumber) => {
    try {
      await AsyncStorage.setItem('@vaidik_ticket_number', ticketNumber);
      if (DEV_MODE) {
        const saved = await AsyncStorage.getItem('@vaidik_ticket_number');
        console.log('✅ Verified ticket in storage:', saved);
      }
    } catch (error) {
      if (DEV_MODE) console.error('❌ Error saving ticket:', error);
    }
  }, []);

  // Handle existing registration flow
  const handleExistingRegistration = useCallback((existingReg) => {
    if (!existingReg?.ticketNumber) return false;

    saveExistingTicket(existingReg.ticketNumber);
    const { status } = existingReg;

    const statusHandlers = {
      approved: () => Alert.alert(
        'Already Registered & Approved! 🎉',
        'Your application has been approved. Please login to access your account.',
        [{ text: 'Login', onPress: () => navigation.replace('Login') }]
      ),
      rejected: () => Alert.alert(
        'Application Status',
        'Your previous application was not approved. Please contact support.',
        [
          { text: 'Check Status', onPress: () => navigation.replace('CheckStatus') },
          { text: 'Back to Login', onPress: () => navigation.replace('Login'), style: 'cancel' },
        ]
      ),
      default: () => Alert.alert(
        'Already Registered',
        `Status: ${existingReg.statusMessage || status}\nTicket: ${existingReg.ticketNumber}`,
        [
          { text: 'View Dashboard', onPress: () => navigation.replace('InterviewDashboard') },
          { text: 'Check Status', onPress: () => navigation.replace('CheckStatus'), style: 'cancel' },
        ]
      ),
    };

    (statusHandlers[status] || statusHandlers.default)();
    return true;
  }, [navigation, saveExistingTicket]);

  // Main verify OTP handler
const handleVerifyOtp = useCallback(async () => {
  if (otpCode.length !== OTP_LENGTH) {
    Vibration.vibrate([0, 50, 100, 50]);
    Alert.alert('Validation', 'Please enter complete 6-digit OTP');
    return;
  }

  if (isVerifying || verificationAttempted.current) {
    if (DEV_MODE) console.log('⚠️ Verification already in progress');
    return;
  }

  try {
    setIsVerifying(true);
    verificationAttempted.current = true;

    if (DEV_MODE) console.log('🔵 Verifying OTP:', otpCode);

    // ✅ This returns the full API response
    const response = await verifyOtp({
      phoneNumber: state.phoneNumber,
      countryCode: state.countryCode,
      otp: otpCode,
    });

    // Success haptic
    Vibration.vibrate(50);

    if (DEV_MODE) {
      console.log('✅ OTP Verified Successfully');
      console.log('📦 Verify OTP Response (from API):', response);
    }

    // ✅ Use response, not context state
    const { isNewUser, existingRegistration } = response.data || {};

    if (!isNewUser && existingRegistration) {
      if (DEV_MODE) {
        console.log('👤 Existing registration detected:', existingRegistration.status);
      }

      const handled = handleExistingRegistration(existingRegistration);
      if (handled) return;
    }

    // New user – go to registration
    if (DEV_MODE) console.log('✅ New user - proceeding to registration');
    navigation.replace('RegisterForm');

  } catch (error) {
    Vibration.vibrate([0, 100, 50, 100]);
    verificationAttempted.current = false;

    if (DEV_MODE) console.error('❌ OTP Verification Error:', error);

    const errorMessage =
      error.response?.data?.message || state.error || 'Invalid OTP. Please try again.';
    Alert.alert('Error', errorMessage);

    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } finally {
    setIsVerifying(false);
  }
}, [
  otpCode,
  isVerifying,
  verifyOtp,
  state.phoneNumber,
  state.countryCode,
  state.error,
  handleExistingRegistration,
  navigation,
]);


  // Resend OTP handler
  const handleResend = useCallback(async () => {
    if (!canResend || isVerifying) return;

    try {
      setIsVerifying(true);
      
      await sendOtp({
        phoneNumber: state.phoneNumber,
        countryCode: state.countryCode,
      });

      setOtp(['', '', '', '', '', '']);
      setTimer(INITIAL_TIMER);
      verificationAttempted.current = false;
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
      // Success haptic
      Vibration.vibrate(50);
      
      Alert.alert('Success', 'New OTP sent successfully');
    } catch (error) {
      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [canResend, isVerifying, sendOtp, state]);

  // Change number handler
  const handleChangeNumber = useCallback(() => {
    if (!isVerifying) {
      navigation.goBack();
    }
  }, [isVerifying, navigation]);

  // Auto-focus first input on mount
  useEffect(() => {
    const focusTimer = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(focusTimer);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          +{state.countryCode} {state.phoneNumber}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Enter OTP (ओटीपी दर्ज करें)</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResend} 
              disabled={isVerifying}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, isVerifying && styles.resendTextDisabled]}>
                {isVerifying ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in {timer}s
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleVerifyOtp}
          disabled={isButtonDisabled}
          style={[
            styles.verifyButton,
            isButtonDisabled && styles.verifyButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>
              {otpComplete ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChangeNumber}
          style={styles.backButton}
          disabled={isVerifying}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, isVerifying && styles.backButtonTextDisabled]}>
            Change Number
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    color: '#5b2b84',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  otpInput: {
    width: 50,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#5b2b84',
    backgroundColor: '#f5f0fa',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  resendText: {
    fontSize: 14,
    color: '#5b2b84',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#999',
  },
  verifyButton: {
    backgroundColor: '#5b2b84',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5b2b84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
  backButtonTextDisabled: {
    color: '#ccc',
  },
});
