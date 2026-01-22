// src/screens/auth/ThankYouScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../style/ThankYouStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

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
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
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
    </ScreenWrapper>
  );
}
