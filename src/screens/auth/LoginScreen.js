// src/screens/auth/Login.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginStyle from '../../style/LoginStyle';
import Toast from 'react-native-toast-message';
import CountryCodePicker from '../../component/CountaryCodePickar';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerAuthService } from '../../services';
import { useTruecaller } from '@ajitpatel28/react-native-truecaller';

const { width, height } = Dimensions.get('window');

const countryRules = {
  IN: 10, US: 10, CA: 10, AU: 9, GB: 10, AE: 9, SA: 9, PK: 10, BD: 10,
  LK: 9, NP: 10, CN: 11, JP: 10, KR: 10, SG: 8, MY: 9, ID: 10, TH: 9,
  PH: 10, VN: 9, NG: 10, EG: 10, TR: 10, RU: 10, BR: 11, MX: 10, CL: 9,
  CO: 10, PE: 9, NZ: 9, DE: 11, FR: 9, IT: 9, ES: 9, NL: 9, CH: 9, SE: 9,
  NO: 8, DK: 8, FI: 9, IE: 9, PT: 9, PL: 9, GR: 10, IL: 9,
};

const Login = ({ navigation }) => {
  const { sendLoginOtp, loginWithTruecaller, state } = useAuth();
  const [phone, setPhone] = useState('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [fcmSetupDone, setFcmSetupDone] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });

  const {
    initializeTruecallerSDK,
    openTruecallerForVerification,
    isSdkUsable,
    error: truecallerError,
  } = useTruecaller({
    androidClientId: '4rxptw6rdoll4cvj6ccb4qobzofhuuznw-ablj5mb_m',
    androidSuccessHandler: handleTruecallerSuccess,
    scopes: ['profile', 'phone', 'openid'],
  });

  const styles = LoginStyle;

  // ===== INITIALIZATION =====

  useEffect(() => {
    const init = async () => {
      try {
        await initializeTruecallerSDK();
        console.log('✅ Truecaller SDK initialized');
      } catch (error) {
        console.log('⚠️ Truecaller init failed:', error.message);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (truecallerError) {
      console.error('❌ Truecaller error:', truecallerError);
      Alert.alert(
        'Truecaller Error',
        'Could not verify with Truecaller. Please use OTP login.'
      );
    }
  }, [truecallerError]);

  useEffect(() => {
    const setupFCMOnMount = async () => {
      try {
        console.log('🎫 [Login] Setting up FCM...');
        const token = await astrologerAuthService.setupFCMToken();
        
        if (token) {
          console.log('✅ [Login] FCM token setup successful');
        } else {
          console.warn('⚠️  [Login] FCM token is null');
        }
        
        setFcmSetupDone(true);
      } catch (error) {
        console.error('❌ [Login] FCM setup error (non-critical):', error.message);
        setFcmSetupDone(true);
      }
    };

    setupFCMOnMount();
  }, []);

  // ===== TRUECALLER HANDLER =====

  async function handleTruecallerSuccess(data) {
    try {
      console.log('🔄 [Login] Processing Truecaller data...');

      const truecallerData = {
        authorizationCode: data.authorizationCode,
        codeVerifier: data.codeVerifier,
      };

      const authResult = await loginWithTruecaller(truecallerData);

      if (authResult && authResult.success) {
        if (authResult.data.canLogin === false) {
          Alert.alert(
            'Account Not Found',
            authResult.data.message + '\n\nWould you like to register as an astrologer?',
            [
              {
                text: 'Register',
                onPress: () => navigation.navigate('RegisterPhone'),
              },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
          return;
        }

        const user = authResult.data?.user;
        const astrologer = authResult.data?.astrologer;
        const isNewUser = authResult.data?.isNewUser;

        if (!user || !astrologer) {
          throw new Error('Invalid response from server');
        }

        // Navigate based on profile completion
        if (!astrologer.isProfileComplete || isNewUser) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Details' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } else {
        throw new Error(authResult?.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ [Login] Truecaller login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Could not complete Truecaller login. Please try OTP login.'
      );
    }
  }

  // ===== HANDLERS =====

  const handleCountrySelect = country => {
    setSelectedCountry(country);
    setPhone('');
  };

  const handleLogin = async () => {
    const expectedLength = countryRules[selectedCountry.code] || 10;

    if (phone.length !== expectedLength) {
      if (!phone) {
        Toast.show({
          type: 'customToast',
          text1: 'Please enter phone number',
          position: 'bottom',
          visibilityTime: 2000,
        });
        return;
      }
      Alert.alert(
        'Invalid Number',
        `Phone number must be ${expectedLength} digits for ${selectedCountry.name}.`
      );
      return;
    }

    try {
      setIsCheckingPhone(true);
      console.log('🔍 Checking phone number...');

      const checkResponse = await astrologerAuthService.checkPhone({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
      });

      if (!checkResponse.data.canLogin) {
        Alert.alert(
          'Account Not Found',
          checkResponse.data.message + '\n\nWould you like to register as an astrologer?',
          [
            {
              text: 'Register',
              onPress: () => navigation.navigate('RegisterPhone'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      console.log('🔵 Sending login OTP...');

      await sendLoginOtp({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
      });

      const fullNumber = `+${selectedCountry.dial_code}${phone}`;
      
      navigation.navigate('OTP', { 
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
        phone: fullNumber,
      });
    } catch (error) {
      console.error('❌ Login Error:', error);
      const errorMessage = 
        error.formattedMessage || 
        error.response?.data?.message || 
        'Failed to proceed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleTermsPress = async () => {
    const url = 'https://vaidiktalk.store/pages/terms-conditions';
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Unable to open link', err.message);
    }
  };

  const handlePrivacyPress = async () => {
    const url = 'https://vaidiktalk.store/pages/privacy-policy';
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Unable to open link', err.message);
    }
  };

  const handleTruecallerLogin = async () => {
    try {
      const isUsable = await isSdkUsable();

      if (!isUsable) {
        Alert.alert(
          'Truecaller Not Available',
          'Please install Truecaller app or use OTP verification.'
        );
        return;
      }

      console.log('📱 Opening Truecaller verification...');
      await openTruecallerForVerification();
    } catch (error) {
      console.error('❌ Truecaller error:', error);
      Alert.alert('Error', 'Could not open Truecaller. Please try OTP login.');
    }
  };

  const isLoading = state.isLoading || isCheckingPhone || !fcmSetupDone;

  // ===== RENDER =====

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={{ 
            flexGrow: 1,
            alignItems: 'center',
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ===== LOADING STATE ===== */}
          {!fcmSetupDone && (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: height * 0.7 
            }}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={{ marginTop: 15, color: '#fff', fontSize: 14 }}>
                Setting up notifications...
              </Text>
            </View>
          )}

          {/* ===== MAIN CONTENT ===== */}
          {fcmSetupDone && (
            <>
              {/* Logo Card */}
              <View style={styles.card}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/Logo-removebg.png')}
                    style={styles.logo}
                  />
                </View>
                <Text style={styles.vaidik}>Vaidik Talk</Text>
              </View>

              {/* Phone Input */}
              <View style={styles.phoneContainer}>
                <CountryCodePicker onSelect={handleCountrySelect} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                  maxLength={countryRules[selectedCountry.code] || 10}
                  editable={!isLoading}
                />
              </View>

              {/* Get OTP Button */}
              <TouchableOpacity 
                style={[styles.otpButton, isLoading && { opacity: 0.6 }]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.otpText}>GET OTP</Text>
                )}
              </TouchableOpacity>

              {/* Terms & Conditions */}
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

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.line} />
              </View>

              {/* Truecaller Button */}
              <TouchableOpacity 
                style={[styles.truecallerButton, isLoading && { opacity: 0.6 }]}
                onPress={handleTruecallerLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/phone-call.png')}
                  style={styles.truecallerIcon}
                />
                <Text style={styles.truecallerText}>Login With Truecaller</Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupWrapper}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => {
                  console.log('🔄 Navigating to RegisterPhone...');
                  navigation.navigate('RegisterPhone');
                }}>
                  <Text style={styles.signupLink}>Register as Astrologer</Text>
                </TouchableOpacity>
              </View>

              {/* Check Status Link */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('CheckStatus')}
                style={styles.checkStatusButton}
              >
                <Text style={styles.checkStatusText}>
                  Already Registered? Check Status
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
