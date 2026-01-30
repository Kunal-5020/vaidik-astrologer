// src/screens/auth/LoginScreen.js
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
  PermissionsAndroid,
} from 'react-native';
import LoginStyle from '../../style/LoginStyle';
import CountryCodePicker from '../../component/CountaryCodePickar';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerAuthService } from '../../services';
import { useTruecaller } from '@ajitpatel28/react-native-truecaller';
import { useToast } from '../../contexts/ToastContext';
import ScreenWrapper from '../../component/ScreenWrapper';

const { height } = Dimensions.get('window');

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
  const { showToast } = useToast();

  const styles = LoginStyle;

  // ===== TRUECALLER CONFIGURATION =====
  const {
    initializeTruecallerSDK,
    openTruecallerForVerification,
    isSdkUsable,
    error: truecallerError,
  } = useTruecaller({
    androidClientId: 'v-uag18awnreosg17r0gpookwknh8gtgfqm3pjdsjdk',
    androidSuccessHandler: handleTruecallerSuccess,
    scopes: ['profile', 'phone', 'openid'],
  });

  useEffect(() => {
    initializeTruecallerSDK().catch(() => {});
  }, []);

 useEffect(() => {
    if (truecallerError) {
      const errStr = truecallerError.toString();
      if (errStr.includes('denied') || errStr.includes('cancel')) {
        showToast( 'Truecaller login cancelled', 'error');
      } else if (errStr !== 'Truecaller SDK not initialized') {
        showToast( 'Truecaller verification failed. Use OTP', 'error');
      }
    }
  }, [truecallerError]);

  useEffect(() => {
    const setupFCMOnMount = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('🔔 Notification permission granted');
          } else {
            console.warn('🔕 Notification permission denied');
          }
        }

        console.log('🎫 [Login] Setting up FCM...');
        const token = await astrologerAuthService.setupFCMToken();
        
        if (token) {
          console.log('✅ [Login] FCM token setup successful');
        } else {
          console.warn('⚠️ [Login] FCM token is null');
        }
        
        setFcmSetupDone(true);
      } catch (error) {
        console.error('❌ [Login] FCM setup error (non-critical):', error.message);
        setFcmSetupDone(true);
      }
    };

    setupFCMOnMount();
  }, []);

  async function handleTruecallerSuccess(data) {
    try {
      const truecallerData = {
        authorizationCode: data.authorizationCode,
        codeVerifier: data.codeVerifier,
        payload: data.payload, 
        signature: data.signature,
      };

      const authResult = await loginWithTruecaller(truecallerData);

      if (authResult?.success) {
        if (authResult.data.canLogin === false) {
           // Handle not registered...
           Alert.alert('Not Registered', 'Please register first.', [
               { text: 'Register', onPress: () => navigation.navigate('RegisterPhone') },
               { text: 'Cancel' }
           ]);
        }
        // AuthContext handles state update
      }
    } catch (error) {
      showToast( error.message, 'error');
    }
  }

  const handleCountrySelect = country => {
    setSelectedCountry(country);
    setPhone('');
  };

  const handleLogin = async () => {
    const expectedLength = countryRules[selectedCountry.code] || 10;

    if (phone.length !== expectedLength) {
      if (!phone) {
        showToast('Please enter phone number', 'error');
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

  // ✅ UPDATED LINKS
  const handleTermsPress = async () => {
    const url = 'https://vaidiktalk.com/terms-and-conditions';
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Unable to open link', err.message);
    }
  };

  const handlePrivacyPress = async () => {
    const url = 'https://vaidiktalk.com/privacy-policy';
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Unable to open link', err.message);
    }
  };

  const handleTruecallerLogin = async () => {
    const isUsable = await isSdkUsable();
    if (!isUsable) {
      showToast( 'Truecaller app not found. Please use OTP.', 'info');
      return;
    }
    await openTruecallerForVerification();
  };

  const isLoading = state.isLoading || isCheckingPhone || !fcmSetupDone;

  return (
    // UPDATED: Set backgroundColor to purple and barStyle to light-content
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
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

          {fcmSetupDone && (
            <>
              <View style={styles.card}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/Logo-removebg.png')}
                    style={styles.logo}
                  />
                </View>
                <Text style={styles.vaidik}>Vaidik Talk</Text>
              </View>

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

              {/* ✅ TERMS & PRIVACY LINKS */}
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

              <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.line} />
              </View>

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

              <View style={styles.signupWrapper}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => {
                  console.log('🔄 Navigating to RegisterPhone...');
                  navigation.navigate('RegisterPhone');
                }}>
                  <Text style={styles.signupLink}>Register as Astrologer</Text>
                </TouchableOpacity>
              </View>

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
    </ScreenWrapper>
  );
};

export default Login;