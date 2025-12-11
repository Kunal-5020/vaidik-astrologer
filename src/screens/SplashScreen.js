import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrationService } from '../services';
import astrologerAuthService from '../services/api/auth.service';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
  try {
    console.log('🔍 Checking user status...');

    // Wait 3 seconds for splash animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ✅ Step 1: Check if astrologer is logged in and get fresh profile
    const accessToken = await AsyncStorage.getItem('@vaidik_access_token');
    
    if (accessToken) {
      console.log('✅ Access token found - fetching fresh profile...');
      
      try {
        // ✅ Fetch fresh profile from API
        const profileResponse = await astrologerAuthService.fetchFreshProfile();
        
        if (profileResponse.success) {
          console.log('✅ Fresh profile loaded - Redirect to Home');
          navigation.replace('Home');
          return;
        }
      } catch (profileError) {
        console.error('❌ Failed to fetch profile:', profileError);
        
        // If profile fetch fails, check if we have cached data
        const cachedAstrologer = await AsyncStorage.getItem('@vaidik_astrologer_data');
        
        if (cachedAstrologer) {
          console.log('⚠️  Using cached profile - Redirect to Home');
          navigation.replace('Home');
          return;
        } else {
          // No valid data, force logout
          console.log('❌ No valid profile data - Redirect to Login');
          await AsyncStorage.multiRemove([
            '@vaidik_access_token',
            '@vaidik_refresh_token',
            '@vaidik_user_data',
            '@vaidik_astrologer_data',
          ]);
          navigation.replace('Login');
          return;
        }
      }
    }

    // ✅ Step 2: Check if user has registered (has ticket number)
    const ticketNumber = await AsyncStorage.getItem('@vaidik_ticket_number');
    
    if (ticketNumber) {
      console.log('📋 User has ticket number:', ticketNumber);
      
      try {
        const response = await registrationService.checkStatusByTicket(ticketNumber);
        
        if (response.success && response.data) {
          const data = response.data.ticketNumber ? response.data : response.data.registration;
          
          console.log('📊 Registration Status:', data.status);
          
          if (data.status === 'approved') {
            console.log('✅ Approved - Redirect to Login');
            navigation.replace('Login');
          } else if (data.status === 'rejected') {
            console.log('❌ Rejected - Redirect to Login');
            navigation.replace('Login');
          } else {
            console.log('📱 Waitlist/Interview - Redirect to Dashboard');
            navigation.replace('InterviewDashboard');
          }
          return;
        }
      } catch (error) {
        console.error('❌ Error checking status:', error);
        await AsyncStorage.removeItem('@vaidik_ticket_number');
      }
    }

    // ✅ Step 3: No token, no ticket - new user, go to login
    console.log('🔐 New user - Redirect to Login');
    navigation.replace('Login');
    
  } catch (error) {
    console.error('❌ Splash error:', error);
    navigation.replace('Login');
  }
};

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 190 }}>
        <Image
          source={require('../assets/Logo-removebg.png')}
          style={styles.logo}
        />
        <View style={styles.VaidikTextRootStyle}>
          <Text style={styles.Vaidik}>Vaidik </Text>
          <Text style={styles.talk}>Talk</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.AstrolgersText}>Astrologer</Text>
        </View>
        <Text style={styles.AstrolgerText}>For Astrologers</Text>
      </View>

      <View style={styles.loaderContainer}>
        <Progress.Circle
          size={50}
          indeterminate={true}
          color="#FFD700"
          unfilledColor="rgba(255, 255, 255, 0.3)"
          borderWidth={0}
          thickness={7}
        />
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#372643',
  },
  logo: {
    width: 190,
    height: 180,
    marginBottom: -2,
    borderRadius: 97,
    backgroundColor: '#372643',
  },
  Vaidik: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    marginLeft: 12,
  },
  talk: {
    fontWeight: 'bold',
    fontSize: 38,
    color: '#fff',
  },
  VaidikTextRootStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  AstrolgersText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'goldenrod',
    textAlign: 'center',
    marginTop: -25,
  },
  AstrolgerText: {
    fontSize: 19,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    marginLeft: 33,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 25,
    right: 15,
  },
});

export default SplashScreen;
