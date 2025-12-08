// src/screens/auth/ThankYouScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const PURPLE = '#5b2b84';
const ORANGE = '#ff9a2e';
const DEV_MODE = __DEV__;

export default function ThankYouScreen({ navigation }) {
  const { state, clearRegistrationData } = useRegistration();
  
  const [tokenNumber, setTokenNumber] = useState(state.ticketNumber || 'N/A');
  const [isLoading, setIsLoading] = useState(false);

  // ===== EFFECTS =====

  useEffect(() => {
    // Load and save ticket number
    const initializeTicket = async () => {
      try {
        // First, try to get from state
        if (state.ticketNumber) {
          setTokenNumber(state.ticketNumber);
          await AsyncStorage.setItem('@vaidik_ticket_number', state.ticketNumber);
          
          if (DEV_MODE) {
            console.log('✅ Ticket saved to storage:', state.ticketNumber);
          }
          return;
        }

        // If not in state, try to load from AsyncStorage
        const savedTicket = await AsyncStorage.getItem('@vaidik_ticket_number');
        if (savedTicket) {
          setTokenNumber(savedTicket);
          if (DEV_MODE) {
            console.log('✅ Ticket loaded from storage:', savedTicket);
          }
        } else {
          console.warn('⚠️ No ticket number found');
        }
      } catch (error) {
        console.error('❌ Error initializing ticket:', error);
      }
    };

    initializeTicket();
  }, [state.ticketNumber]);

  // ===== HANDLERS =====

  const handleViewDashboard = async () => {
    if (tokenNumber === 'N/A') {
      Alert.alert(
        'No Ticket Number',
        'Your ticket number is not available. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      if (DEV_MODE) {
        console.log('📱 Navigating to Dashboard with ticket:', tokenNumber);
      }

      // Optional: Clear registration data after successful submission
      // await clearRegistrationData?.();

      navigation.replace('InterviewDashboard', {
        ticketNumber: tokenNumber,
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = () => {
    if (DEV_MODE) {
      console.log('📋 Navigating to Check Status with ticket:', tokenNumber);
    }

    navigation.navigate('CheckStatus', {
      ticketNumber: tokenNumber !== 'N/A' ? tokenNumber : undefined,
    });
  };

  const handleLogin = () => {
    if (DEV_MODE) {
      console.log('🔐 Navigating to Login');
    }

    navigation.navigate('Login');
  };

  const handleBackToLogin = () => {
    if (DEV_MODE) {
      console.log('🔙 Going back to Login');
    }

    // Reset navigation stack to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // ===== RENDER =====

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header (White Section) */}
        <View style={styles.headerContainer}>
          <Text style={styles.thank}>Thank</Text>
          <Text style={[styles.thank, styles.thankLower]}>you!</Text>
        </View>

        {/* Purple Section */}
        <View style={styles.card}>
          <View style={styles.cardInner}>
            {/* Success Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.cardText}>
                Thank You for submitting your details with VaidikTalk, your
                token number is{' '}
                <Text style={styles.token}>{tokenNumber}</Text>
              </Text>

              <Text style={styles.cardTextSpacer}>
                Our team shall reach out to you for interviews within 4 weeks if
                they find you shortlisted.
              </Text>

              <Text style={styles.cardTextSmall}>
                For more information you can email at{' '}
                <Text style={styles.emailText}>vaidiktalk@gmail.com</Text>. We
                look forward to having you on board.
              </Text>
            </View>

            <View style={styles.flexSpacer} />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* View Dashboard Button */}
              <TouchableOpacity
                style={[
                  styles.dashboardBtn,
                  isLoading && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleViewDashboard}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.dashboardText}>View Dashboard</Text>
                )}
              </TouchableOpacity>

              {/* Check Status Button */}
              <TouchableOpacity
                style={[
                  styles.checkStatusBtn,
                  isLoading && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleCheckStatus}
                disabled={isLoading}
              >
                <Text style={styles.checkStatusText}>Check Status</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginBtn,
                  isLoading && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity
                onPress={handleBackToLogin}
                style={styles.backToLoginContainer}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.backToLoginText,
                    isLoading && styles.textDisabled,
                  ]}
                >
                  ← Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== STYLES =====

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thank: {
    fontSize: Math.min(width * 0.16, 64),
    fontWeight: '800',
    letterSpacing: -2,
    transform: [{ rotate: '-6deg' }],
    color: '#1f2937',
    lineHeight: Math.min(width * 0.18, 72),
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  thankLower: {
    transform: [{ rotate: '6deg' }],
    color: PURPLE,
  },
  card: {
    width: '100%',
    backgroundColor: PURPLE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -height * 0.01,
    minHeight: height * 0.72,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardInner: {
    flex: 1,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
    justifyContent: 'space-between',
  },
  messageContainer: {
    marginBottom: height * 0.02,
  },
  cardText: {
    color: '#F5F0FB',
    fontSize: Math.min(width * 0.042, 17),
    lineHeight: Math.min(width * 0.058, 24),
    textAlign: 'center',
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  token: {
    fontWeight: '800',
    color: ORANGE,
    fontSize: Math.min(width * 0.048, 20),
    letterSpacing: 0.5,
  },
  cardTextSpacer: {
    color: '#E9DFF4',
    fontSize: Math.min(width * 0.038, 15),
    lineHeight: Math.min(width * 0.052, 22),
    marginBottom: height * 0.025,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardTextSmall: {
    color: '#D8C9ED',
    fontSize: Math.min(width * 0.034, 14),
    lineHeight: Math.min(width * 0.05, 20),
    textAlign: 'center',
    fontWeight: '400',
  },
  emailText: {
    color: ORANGE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  flexSpacer: {
    flex: 1,
    minHeight: height * 0.02,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dashboardBtn: {
    width: '92%',
    borderRadius: 12,
    backgroundColor: ORANGE,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dashboardText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: Math.min(width * 0.045, 18),
    letterSpacing: 0.5,
  },
  checkStatusBtn: {
    width: '92%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
  },
  checkStatusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Math.min(width * 0.042, 17),
    letterSpacing: 0.3,
  },
  loginBtn: {
    width: '92%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ORANGE,
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Math.min(width * 0.042, 17),
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backToLoginContainer: {
    paddingVertical: height * 0.018,
    marginTop: height * 0.01,
  },
  backToLoginText: {
    color: '#E9DFF4',
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '600',
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.5,
  },
});
