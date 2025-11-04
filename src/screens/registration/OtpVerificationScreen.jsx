import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OtpVerificationScreen({ navigation }) {
  const { verifyOtp, sendOtp, state } = useRegistration();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Validation', 'Please enter complete 6-digit OTP');
      return;
    }

    if (isVerifying || verificationAttempted.current) {
      console.log('⚠️ Verification already in progress, ignoring duplicate call');
      return;
    }

    try {
      setIsVerifying(true);
      verificationAttempted.current = true;

      console.log('🔵 Verifying OTP:', otpCode);

      // ✅ Call verifyOtp and get the response directly
      const response = await verifyOtp({
        phoneNumber: state.phoneNumber,
        countryCode: state.countryCode,
        otp: otpCode,
      });

      console.log('✅ OTP Verified Successfully');
      console.log('📦 Full Response:', response);

      // ✅ Check existingRegistration from response, not from state
      const existingReg = response?.data?.existingRegistration || state.existingRegistration;
      
      console.log('🔍 Checking existingRegistration:', existingReg);

      if (existingReg && existingReg.ticketNumber) {
        console.log('📋 Existing Registration Found:', existingReg);

        // ✅ Save ticket number to AsyncStorage
        try {
          await AsyncStorage.setItem('@vaidik_ticket_number', existingReg.ticketNumber);
          console.log('✅ Existing ticket saved:', existingReg.ticketNumber);
          
          // Verify it was saved
          const saved = await AsyncStorage.getItem('@vaidik_ticket_number');
          console.log('✅ Verified ticket in storage:', saved);
        } catch (error) {
          console.error('❌ Error saving existing ticket:', error);
        }

        // ✅ Redirect based on status
        const status = existingReg.status;
        
        if (status === 'approved') {
          Alert.alert(
            'Already Registered & Approved! 🎉',
            'Your application has been approved. Please login to access your account.',
            [
              {
                text: 'Login',
                onPress: () => navigation.replace('Login'),
              },
            ]
          );
        } else if (status === 'rejected') {
          Alert.alert(
            'Application Status',
            'Your previous application was not approved. Please contact support for more information.',
            [
              {
                text: 'Check Status',
                onPress: () => navigation.replace('CheckStatus'),
              },
              {
                text: 'Back to Login',
                onPress: () => navigation.replace('Login'),
                style: 'cancel',
              },
            ]
          );
        } else {
          // Waitlist or Interview stages
          Alert.alert(
            'Already Registered',
            `You have already registered.\n\nStatus: ${existingReg.statusMessage || status}\n\nTicket: ${existingReg.ticketNumber}`,
            [
              {
                text: 'View Dashboard',
                onPress: () => navigation.replace('InterviewDashboard'),
              },
              {
                text: 'Check Status',
                onPress: () => navigation.replace('CheckStatus'),
                style: 'cancel',
              },
            ]
          );
        }
      } else {
        // ✅ New user - proceed to registration form
        console.log('✅ New user - proceeding to registration');
        navigation.replace('RegisterForm');
      }
    } catch (error) {
      console.error('❌ OTP Verification Error:', error);
      
      verificationAttempted.current = false;
      
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setIsVerifying(true);
      
      await sendOtp({
        phoneNumber: state.phoneNumber,
        countryCode: state.countryCode,
      });

      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      setCanResend(false);
      verificationAttempted.current = false;
      
      Alert.alert('Success', 'New OTP sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              style={styles.otpInput}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isVerifying}>
              <Text style={styles.resendText}>
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
          disabled={isVerifying || otp.join('').length !== 6}
          style={[
            styles.verifyButton,
            (isVerifying || otp.join('').length !== 6) && styles.verifyButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={isVerifying}
        >
          <Text style={styles.backButtonText}>Change Number</Text>
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  verifyButton: {
    backgroundColor: '#5b2b84',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
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
});
