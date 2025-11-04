import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import OTPStyle from '../../style/OTPStyle';
import { useAuth } from '../../contexts/AuthContext';

const OTPScreen = ({ navigation, route }) => {
  const { verifyLoginOtp, sendLoginOtp, state } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const styles = OTPStyle;

  const { phone, countryCode, phoneNumber } = route.params || {};

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      setTimer(30);
      
      Alert.alert('Success', 'New OTP sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      Alert.alert('Validation', 'Please enter complete 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      console.log('🔵 Verifying astrologer login OTP:', enteredOtp);

      const response = await verifyLoginOtp({
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        otp: enteredOtp,
      });

      console.log('✅ Astrologer login successful:', response);

      // Navigate to Home
      navigation.replace('Home');
    } catch (error) {
      console.error('❌ OTP Verification Error:', error);
      
      const errorMessage = error.formattedMessage || error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.Cantainer}>
      <View style={styles.headContiner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {/* Back button if needed */}
        </TouchableOpacity>
        <Text style={styles.VerfiyText}>Verify Phone</Text>
      </View>

      <View style={styles.lineStyle}></View>
      <View style={styles.setnMessaheStore}>
        <Text style={styles.sentMessageSyle}>
          OTP sent to <Text style={styles.highlightNumber}>{phone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              style={styles.boxInput}
              ref={ref => (inputRefs.current[index] = ref)}
              editable={!isVerifying}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isVerifying && { opacity: 0.5 }]}
          onPress={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Submit</Text>
          )}
        </TouchableOpacity>

        {timer > 0 ? (
          <Text style={styles.timerText}>Resend OTP available in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.lineCantainer}>
        <View style={styles.line1}></View>
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line2}></View>
      </View>

      <TouchableOpacity style={styles.truecallerButton}>
        <Text style={styles.truecallerText}>Login With Truecaller</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;
