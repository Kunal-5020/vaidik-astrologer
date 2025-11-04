import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import LoginStyle from '../../style/LoginStyle';
import Toast from 'react-native-toast-message';
import CountryCodePicker from '../../component/CountaryCodePickar';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerAuthService } from '../../services';

const countryRules = {
  IN: 10,
  US: 10,
  CA: 10,
  AU: 9,
  GB: 10,
  AE: 9,
  SA: 9,
  PK: 10,
  BD: 10,
  LK: 9,
  NP: 10,
  CN: 11,
  JP: 10,
  KR: 10,
  SG: 8,
  MY: 9,
  ID: 10,
  TH: 9,
  PH: 10,
  VN: 9,
  NG: 10,
  EG: 10,
  TR: 10,
  RU: 10,
  BR: 11,
  MX: 10,
  CL: 9,
  CO: 10,
  PE: 9,
  NZ: 9,
  DE: 11,
  FR: 9,
  IT: 9,
  ES: 9,
  NL: 9,
  CH: 9,
  SE: 9,
  NO: 8,
  DK: 8,
  FI: 9,
  IE: 9,
  PT: 9,
  PL: 9,
  GR: 10,
  IL: 9,
};

const Login = ({ navigation }) => {
  const { sendLoginOtp, state } = useAuth();
  const [phone, setPhone] = useState('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });

  const styles = LoginStyle;

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
        `Phone number must be ${expectedLength} digits for ${selectedCountry.name}.`,
      );
      return;
    }

    try {
      setIsCheckingPhone(true);
      console.log('🔍 Checking if phone number has astrologer account...');

      // ✅ STEP 1: Check if phone number has approved astrologer account
      const checkResponse = await astrologerAuthService.checkPhone({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
      });

      console.log('✅ Check Phone Response:', checkResponse);

      if (!checkResponse.data.canLogin) {
        // No approved account found
        Alert.alert(
          'Account Not Found',
          checkResponse.data.message + '\n\nWould you like to register as an astrologer?',
          [
            {
              text: 'Register',
              onPress: () => navigation.navigate('RegisterPhone'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      setIsCheckingPhone(false);

      // ✅ STEP 2: Send OTP (only if approved account exists)
      console.log('🔵 Sending login OTP...');

      await sendLoginOtp({
        phoneNumber: phone,
        countryCode: selectedCountry.dial_code,
      });

      console.log('✅ OTP sent successfully');

      const fullNumber = `+${selectedCountry.dial_code}${phone}`;
      
      // Navigate to OTP screen
      navigation.navigate('OTP', { 
        phone: fullNumber,
        countryCode: selectedCountry.dial_code,
        phoneNumber: phone,
      });
    } catch (error) {
      console.error('❌ Login Error:', error);
      
      const errorMessage = error.formattedMessage || error.response?.data?.message || 'Failed to proceed. Please try again.';
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

  const isLoading = state.isLoading || isCheckingPhone;

  return (
    <View style={styles.container}>
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
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
          maxLength={countryRules[selectedCountry.code] || 10}
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.otpButton, isLoading && { opacity: 0.5 }]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.otpText}>GET OTP</Text>
        )}
      </TouchableOpacity>

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

      <View style={{ flexDirection: 'row' }}>
        <View style={styles.line}></View>
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line1}></View>
      </View>

      <TouchableOpacity style={styles.truecallerButton}>
        <Image
          source={require('../../assets/phone-call.png')}
          style={styles.truecallerIcon}
        />
        <Text style={styles.truecallerText}>Login With Truecaller</Text>
      </TouchableOpacity>

      <View style={styles.signupWrapper}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterPhone')}>
          <Text style={styles.signupLink}>Register as Astrologer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('CheckStatus')}
        style={{ marginTop: 12 }}
      >
        <Text style={[styles.signupText, { textAlign: 'center', color: '#5b2b84' }]}>
          Already Registered? Check Status
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
