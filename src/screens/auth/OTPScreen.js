// src/screens/auth/AstrologerOTPScreen.js (CLEANED)
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
  BackHandler,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import OTPStyles from '../../style/OTPStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

const AstrologerOTPScreen = ({ navigation, route }) => {
  // 1. Removed loginWithTruecaller from hook
  const { sendLoginOtp, verifyLoginOtp, state } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const inputRefs = useRef([]);

  // ✅ Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = OTPStyles;
  const { phone, countryCode, phoneNumber } = route.params || {};

  // ✅ Fade-in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Pulse animation for timer (when < 10 seconds)
  useEffect(() => {
    if (timer > 0 && timer <= 10) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timer]);

  // ✅ Glow animation for verify button when OTP complete
  useEffect(() => {
    const isOtpComplete = otp.every(digit => digit !== '');
    if (isOtpComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [otp]);

  // ✅ Setup device info
  useEffect(() => {
    const setupDeviceInfo = async () => {
      try {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!fcmToken) fcmToken = 'pending';

        const deviceId = await DeviceInfo.getUniqueId();
        const isTablet = await DeviceInfo.isTablet();
        const deviceType = isTablet ? 'tablet' : 'phone';
        let deviceName = await DeviceInfo.getModel();
        if (!deviceName || deviceName === 'unknown') {
          deviceName = `${Platform.OS}_device`;
        }

        setDeviceInfo({
          fcmToken: fcmToken || 'pending',
          deviceId: deviceId || 'unknown',
          deviceType: deviceType || 'phone',
          deviceName: deviceName || 'unknown',
        });
      } catch (error) {
        console.error('Device info error:', error);
        setDeviceInfo({
          fcmToken: 'pending',
          deviceId: 'unknown',
          deviceType: Platform.OS === 'android' ? 'android' : 'ios',
          deviceName: 'unknown',
        });
      }
    };

    setupDeviceInfo();
  }, []);

  // ✅ Timer countdown
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ✅ Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  /**
   * ✅ Handle OTP input change
   */
  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (text && newOtp.every(digit => digit !== '') && index === 5) {
      Keyboard.dismiss();
      setTimeout(() => handleVerify(newOtp.join('')), 300);
    }
  };

  /**
   * ✅ Handle backspace
   */
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * ✅ Handle resend OTP
   */
  const handleResend = async () => {
    if (timer > 0) return;

    try {
      setIsVerifying(true);

      await sendLoginOtp({
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      });

      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      inputRefs.current[0]?.focus();

      Alert.alert('Success', 'New OTP sent to your phone');
    } catch (error) {
      console.error('Resend failed:', error);
      Alert.alert('Error', error.formattedMessage || 'Failed to resend OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * ✅ Handle OTP verification
   */
  const handleVerify = async (otpValue = otp.join('')) => {
    Keyboard.dismiss();

    if (otpValue.length !== 6) {
      // Shake animation for error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      Alert.alert('Invalid OTP', 'Please enter all 6 digits');
      return;
    }

    if (!deviceInfo) {
      Alert.alert('Error', 'Device information not ready. Try again.');
      return;
    }

    try {
      setIsVerifying(true);
      console.log('🔐 [OTPScreen] Starting OTP verification...');

      const response = await verifyLoginOtp({
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        otp: otpValue,
        fcmToken: deviceInfo.fcmToken,
        deviceId: deviceInfo.deviceId,
        deviceType: deviceInfo.deviceType,
        deviceName: deviceInfo.deviceName,
      });

      console.log('✅ [OTPScreen] OTP verification successful', response);

      if (response?.success) {
        const astrologer = response.data?.astrologer;

        // Navigate based on profile completion
        if (!astrologer?.isProfileComplete) {
          console.log('🔄 [OTPScreen] Navigating to Details screen');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          console.log('🔄 [OTPScreen] Navigating to main app');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } else {
        throw new Error('Verification response invalid');
      }
    } catch (error) {
      console.error('❌ [OTPScreen] Verification failed:', error);

      // Shake animation for error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      const errorMessage =
        error.formattedMessage ||
        error.response?.data?.message ||
        'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', errorMessage);

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const canSubmit = isOtpComplete && !isVerifying && !!deviceInfo;

  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
      <Animated.View 
        style={[
          styles.mainContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: shakeAnim }],
          }
        ]}
      >
        {/* ✅ Header */}
        <View>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              disabled={isVerifying}
            >
              <Icon name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify Phone</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.divider} />
        </View>

        {/* ✅ Content */}
        <View style={styles.contentContainer}>
          {/* ✅ Message */}
          <Text style={styles.messageText}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumberHighlight}>{phone}</Text>
          </Text>

          {deviceInfo ? (
            <>
              {/* ✅ OTP Input Boxes */}
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="numeric"
                    maxLength={1}
                    style={[
                      styles.otpBox,
                      focusedIndex === index && styles.otpBoxFocused,
                      digit !== '' && styles.otpBoxFilled,
                    ]}
                    editable={!isVerifying}
                    selectTextOnFocus
                    placeholder="0"
                    placeholderTextColor="#cccccc"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  !canSubmit && styles.verifyButtonDisabled,
                ]}
                onPress={() => handleVerify()}
                disabled={!canSubmit}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              {/* ✅ Resend Container with Pulse Animation */}
              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Animated.View
                    style={{
                      transform: [{ scale: timer <= 10 ? pulseAnim : 1 }],
                    }}
                  >
                    <Text style={styles.timerText}>
                      Resend OTP in{' '}
                      <Text style={styles.timerHighlight}>{timer}s</Text>
                    </Text>
                  </Animated.View>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={isVerifying}
                    style={{ opacity: isVerifying ? 0.5 : 1 }}
                  >
                    <Text style={styles.resendText}>
                      Didn't receive the code?{' '}
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Preparing device...</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
};

export default AstrologerOTPScreen;