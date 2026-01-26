import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../../component/ScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../style/ThankYouStyle';

const ThankYouScreen = ({ navigation }) => {
  const { state } = useRegistration();
  const [tokenNumber, setTokenNumber] = useState(state.ticketNumber || 'N/A');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current; // Reduced slide distance

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true })
    ]).start();

    const initializeTicket = async () => {
      try {
        if (state.ticketNumber) {
          setTokenNumber(state.ticketNumber);
          await AsyncStorage.setItem('@vaidik_ticket_number', state.ticketNumber);
        } else {
          const savedTicket = await AsyncStorage.getItem('@vaidik_ticket_number');
          if (savedTicket) setTokenNumber(savedTicket);
        }
      } catch (error) {
        console.error('❌ Ticket Error:', error);
      }
    };
    initializeTicket();
  }, [state.ticketNumber]);

  const handleAction = async (action) => {
    setIsLoading(true);
    try {
      if (action === 'dashboard') {
        if (tokenNumber === 'N/A') {
           Alert.alert('Error', 'Ticket number missing.');
           return;
        }
        navigation.replace('InterviewDashboard', { ticketNumber: tokenNumber });
      } else if (action === 'status') {
        navigation.navigate('CheckStatus', { ticketNumber: tokenNumber });
      } else if (action === 'login') {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        
        {/* Top Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.circleIcon}>
            <Ionicons name="checkmark" size={50} color="#fff" />
          </View>
        </View>

        {/* Animated Main Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.textGroup}>
            <Text style={styles.title}>Thank You!</Text>
            <Text style={styles.subtitle}>Your application has been submitted successfully.</Text>
          </View>

          {/* Ticket Card */}
          <View style={styles.ticketCard}>
            <Text style={styles.ticketLabel}>APPLICATION TICKET</Text>
            <Text style={styles.ticketValue}>{tokenNumber}</Text>
            <View style={styles.dashedLine} />
            <Text style={styles.ticketInfo}>
              Please save this ticket number. Review in 1 week.
            </Text>
          </View>

        </Animated.View>

        {/* Bottom Buttons - Pinned to bottom via Flexbox */}
        <View style={styles.btnContainer}>
          <TouchableOpacity 
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]} 
            onPress={() => handleAction('dashboard')}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Go to Dashboard</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => handleAction('status')}
            disabled={isLoading}
          >
            <Text style={styles.secondaryBtnText}>Check Status</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.textBtn} 
            onPress={() => handleAction('login')}
          >
            <Text style={styles.textBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

    </ScreenWrapper>
  );
};

export default ThankYouScreen;