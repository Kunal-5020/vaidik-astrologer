import React, { useState } from 'react';
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

export default function PhoneNumberScreen({ navigation }) {
  const { sendOtp, state } = useRegistration();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91');

  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      Alert.alert('Validation', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      console.log('🔵 Sending OTP for:', { phoneNumber, countryCode });

      await sendOtp({
        phoneNumber,
        countryCode,
      });

      console.log('✅ OTP sent successfully');
      
      // Navigate to OTP screen
      navigation.navigate('RegisterOTP');
    } catch (error) {
      console.error('❌ OTP Error:', error);
      
      // Show detailed error
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to send OTP. Please check your connection.';
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.titleBold}>VaidikTalk</Text>
        <Text style={styles.subtitle}>Register as Astrologer</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Mobile Number (मोबाइल नंबर)</Text>
        
        <View style={styles.phoneRow}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCodeText}>+{countryCode}</Text>
          </View>
          
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* ✅ Show error message if exists */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {state.error}</Text>
          </View>
        )}

        <Text style={styles.infoText}>
          We will send you an OTP for verification
        </Text>

        <TouchableOpacity
          onPress={handleSendOtp}
          disabled={state.isLoading || phoneNumber.length !== 10}
          style={[
            styles.sendButton,
            (state.isLoading || phoneNumber.length !== 10) && styles.sendButtonDisabled,
          ]}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CheckStatus')}
          style={styles.checkStatusButton}
        >
          <Text style={styles.checkStatusText}>
            Already Registered? Check Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#333',
    fontWeight: '400',
  },
  titleBold: {
    fontSize: 36,
    color: '#5b2b84',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryCodeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  sendButton: {
    backgroundColor: '#5b2b84',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkStatusButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkStatusText: {
    color: '#5b2b84',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
