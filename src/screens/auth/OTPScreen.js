// src/screens/auth/AstrologerOTPScreen.js (COMPLETELY FIXED)
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OTPStyles from '../../style/OTPStyle';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const AstrologerOTPScreen = ({ navigation, route }) => {
  // ✅ FIXED: Destructure verifyLoginOtp correctly
  const { sendLoginOtp, verifyLoginOtp, state } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const inputRefs = useRef([]);

  const styles = OTPStyles;
  const { phone, countryCode, phoneNumber } = route.params || {};

  // ✅ Setup device info silently
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

  // Timer effect
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle back button
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

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (text && newOtp.every((digit, idx) => {
      if (idx <= index) return digit !== '';
      return otp[idx] !== '';
    }) && index === 5) {
      Keyboard.dismiss();
      setTimeout(() => handleVerify(newOtp.join('')), 300);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

  // ✅ FIXED: handleVerify function
  const handleVerify = async (otpValue = otp.join('')) => {
    Keyboard.dismiss();

    if (otpValue.length !== 6) {
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

      // ✅ FIXED: Call verifyLoginOtp directly (not state.verifyLoginOtp!)
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
        console.log('🎉 [OTPScreen] Redirecting to Home screen...');
        navigation.replace('Home');
      } else {
        throw new Error('Verification response invalid');
      }
    } catch (error) {
      console.error('❌ [OTPScreen] Verification failed:', error);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={styles.mainContainer}>
        {/* Header */}
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

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Message */}
          <Text style={styles.messageText}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumberHighlight}>{phone}</Text>
          </Text>

          {/* OTP Input Boxes */}
          {deviceInfo ? (
            <>
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
                    placeholder="•"
                    placeholderTextColor="#ffffff40"
                  />
                ))}
              </View>

              {/* Verify Button */}
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

              {/* Resend Container */}
              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend OTP in{' '}
                    <Text style={styles.timerHighlight}>{timer}s</Text>
                  </Text>
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

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Truecaller Button */}
              <TouchableOpacity
                style={styles.truecallerButton}
                disabled={isVerifying}
                onPress={() => console.log('Truecaller login')}
              >
                <Icon name="phone" size={20} color="#000000" />
                <Text style={styles.truecallerButtonText}>
                  Verify with Truecaller
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text
                style={[
                  styles.timerText,
                  { marginTop: 12, color: '#FFD700', fontWeight: '500' },
                ]}
              >
                Preparing device...
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AstrologerOTPScreen;
