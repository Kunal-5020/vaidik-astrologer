import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
  Alert,
  Vibration,
  Linking // ✅ Added Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenWrapper from '../../component/ScreenWrapper';
import CountryCodePicker from '../../component/CountaryCodePickar';
import { registrationService } from '../../services/api/registration.service';
import { useToast } from '../../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../style/PhoneNumberStyle';

const PhoneNumberScreen = ({ navigation }) => {
  const { showToast } = useToast();
  
  // ================= STATE =================
  const [step, setStep] = useState(1); // 1: Phone Input, 2: OTP Verification
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 Digit OTP
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });

  const otpInputs = useRef([]);

  // ================= EFFECTS =================
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ================= LINKS HANDLER =================
  const openLink = async (url) => {
    try {
      // Directly attempt to open the URL. This bypasses the Android 11+ query restrictions.
      await Linking.openURL(url);
    } catch (error) {
      console.error("Link Error", error);
      Alert.alert("Error", "Could not open the browser. Please check your internet connection.");
    }
  };

  // ================= HELPER: HANDLE EXISTING USER =================
  const handleExistingRegistration = async (existingReg) => {
    if (!existingReg?.ticketNumber) return false;

    // Save ticket locally for persistent login state
    try {
      await AsyncStorage.setItem('@vaidik_ticket_number', existingReg.ticketNumber);
    } catch (e) { console.error('Storage Error', e); }

    const { status } = existingReg;

    if (status === 'approved') {
        Alert.alert(
            'Already Registered & Approved! 🎉',
            'Your application has been approved. Please login to access your account.',
            [{ text: 'Login', onPress: () => navigation.replace('Login') }]
        );
    } else if (status === 'rejected') {
        Alert.alert(
            'Application Status',
            'Your previous application was not approved. Please contact support.',
            [
              { text: 'Check Status', onPress: () => navigation.replace('CheckStatus') },
              { text: 'Back to Login', onPress: () => navigation.replace('Login'), style: 'cancel' },
            ]
        );
    } else {
        // Pending or Under Review
        Alert.alert(
            'Already Registered',
            `Status: ${existingReg.statusMessage || status}\nTicket: ${existingReg.ticketNumber}`,
            [
              { text: 'View Dashboard', onPress: () => navigation.replace('InterviewDashboard', { ticketNumber: existingReg.ticketNumber }) },
              { text: 'Check Status', onPress: () => navigation.replace('CheckStatus'), style: 'cancel' },
            ]
        );
    }
    return true;
  };

  // ================= LOGIC: PHONE STEP =================
  const handleSendOtp = async () => {
    if (phone.length < 8) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const fullPhoneNumber = `+${selectedCountry.dial_code}${phone}`;
      console.log('Sending OTP to:', fullPhoneNumber);

      const response = await registrationService.sendOtp({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
      });

      if (response.success) {
        showToast('OTP Sent Successfully', 'success');
        setStep(2);
        setTimer(30);
        setCanResend(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Network Error';
      Alert.alert('Registration Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= LOGIC: OTP STEP =================
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Vibration.vibrate(50);
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registrationService.verifyOtp({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
        otp: enteredOtp,
      });

      // ✅ CHECK IF USER EXISTS
      const { isNewUser, existingRegistration } = response.data || {};

      if (!isNewUser && existingRegistration) {
          const handled = await handleExistingRegistration(existingRegistration);
          if (handled) {
              setIsLoading(false);
              return; // Stop here, user redirected
          }
      }

      // ✅ IF NEW USER -> PROCEED TO REGISTRATION FORM
      if (response.success) {
        showToast('Verified Successfully', 'success');
        
        navigation.replace('RegisterForm', {
          phone: phone,
          countryCode: selectedCountry.dial_code,
          token: response.data?.token 
        });
      }
    } catch (error) {
      console.error(error);
      Vibration.vibrate(100);
      Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']); // Clear OTP on fail
      otpInputs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(30);
    setCanResend(false);
    handleSendOtp();
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    // Auto focus prev input on delete
    if (!text && index > 0) {
      otpInputs.current[index - 1].focus();
    }
    
    // Auto submit if full (Optional UX improvement)
    if (index === 5 && text) {
      Keyboard.dismiss();
    }
  };

  const changeNumber = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
  };

  // ================= RENDER =================
  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content" avoidKeyboard>
      <View style={styles.container}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => step === 1 ? navigation.goBack() : changeNumber()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/Logo-removebg.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Vaidik Astrologer</Text>
          </View>
        </View>

        {/* WHITE CARD SECTION */}
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 1 ? 'Astrologer Registration' : 'Verify Mobile'}
          </Text>
          
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Enter your mobile number to begin your journey as a verified astrologer.' 
              : `Enter the 6-digit code sent to +${selectedCountry.dial_code} ${phone}`
            }
          </Text>

          {/* STEP 1: PHONE INPUT */}
          {step === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.countryContainer}>
                  <CountryCodePicker 
                    selected={selectedCountry} 
                    onSelect={setSelectedCountry} 
                  />
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Mobile Number"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Get Verification Code</Text>
                )}
                {!isLoading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: OTP INPUT */}
          {step === 2 && (
            <View style={styles.formContainer}>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                        otpInputs.current[index - 1].focus();
                      }
                    }}
                  />
                ))}
              </View>

              <View style={styles.timerRow}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend code in <Text style={styles.timerBold}>00:{timer < 10 ? `0${timer}` : timer}</Text>
                  </Text>
                )}
                
                <TouchableOpacity onPress={changeNumber}>
                  <Text style={styles.changeNumberText}>Edit Number</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Proceed</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ✅ FOOTER LINKS */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerNote}>
              By continuing, you agree to our{' '}
              <Text 
                style={styles.linkText}
                onPress={() => openLink('https://vaidiktalk.com/terms-and-conditions')}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => openLink('https://vaidiktalk.com/privacy-policy')}
              >
                Privacy Policy
              </Text>.
            </Text>
          </View>

        </View>

      </View>
    </ScreenWrapper>
  );
};

export default PhoneNumberScreen;