import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRegistration } from '../../contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const PURPLE = '#4b2b6a';
const ORANGE = '#ff9a2e';

export default function ThankYouScreen({ navigation }) {
  const { state } = useRegistration();
  const tokenNumber = state.ticketNumber || 'N/A';

  useEffect(() => {
    // ✅ Save ticket number to AsyncStorage (backup save)
    const saveTicket = async () => {
      if (state.ticketNumber) {
        try {
          await AsyncStorage.setItem('@vaidik_ticket_number', state.ticketNumber);
          console.log('✅ Ticket number saved to AsyncStorage:', state.ticketNumber);
          
          // ✅ Verify it was saved
          const saved = await AsyncStorage.getItem('@vaidik_ticket_number');
          console.log('✅ Verified ticket in storage:', saved);
        } catch (error) {
          console.error('❌ Error saving ticket number:', error);
        }
      } else {
        console.warn('⚠️ No ticket number in state');
      }
    };

    saveTicket();
  }, [state.ticketNumber]);

  const handleViewDashboard = () => {
    console.log('📱 Navigating to Dashboard with ticket:', state.ticketNumber);
    navigation.replace('InterviewDashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (White Section) */}
        <View style={styles.headerContainer}>
          <Text style={styles.thank}>Thank</Text>
          <Text style={[styles.thank, styles.thankLower]}>you!</Text>
        </View>

        {/* Purple Section */}
        <View style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.cardText}>
              Thank You for submitting your details with VaidikTalk, your token
              number is{' '}
              <Text style={styles.token}>{tokenNumber}</Text>
            </Text>

            <Text style={styles.cardTextSpacer}>
              Our team shall reach out to you for interviews within 4 weeks if
              they find you shortlisted.
            </Text>

            <Text style={styles.cardTextSmall}>
              For more information you can email at (vaidiktalk@gmail.com). We
              look forward to having you on board.
            </Text>

            <View style={styles.flexSpacer} />

            {/* View Dashboard Button */}
            <TouchableOpacity
              style={styles.dashboardBtn}
              activeOpacity={0.85}
              onPress={handleViewDashboard}
            >
              <Text style={styles.dashboardText}>View Dashboard</Text>
            </TouchableOpacity>

            {/* Check Status Button */}
            <TouchableOpacity
              style={styles.checkStatusBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CheckStatus')}
            >
              <Text style={styles.checkStatusText}>Check Status</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.backToLoginContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingBottom: height * 0.03,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  thank: {
    fontSize: width * 0.16,
    fontWeight: '800',
    letterSpacing: -2,
    transform: [{ rotate: '-6deg' }],
    color: '#111',
    lineHeight: width * 0.18,
  },
  thankLower: {
    transform: [{ rotate: '6deg' }],
  },
  card: {
    width: '100%',
    backgroundColor: PURPLE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -height * 0.01,
    minHeight: height * 0.75,
    justifyContent: 'flex-start',
  },
  cardInner: {
    flex: 1,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
    justifyContent: 'space-between',
  },
  cardText: {
    color: '#F0EAF5',
    fontSize: width * 0.04,
    lineHeight: width * 0.055,
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  token: {
    fontWeight: '700',
    color: '#fff',
  },
  cardTextSpacer: {
    color: '#E9DFF4',
    fontSize: width * 0.035,
    lineHeight: width * 0.05,
    marginBottom: height * 0.025,
    textAlign: 'center',
  },
  cardTextSmall: {
    color: '#D1C2E7',
    fontSize: width * 0.032,
    lineHeight: width * 0.048,
    textAlign: 'center',
  },
  flexSpacer: {
    flex: 1,
  },
  dashboardBtn: {
    alignSelf: 'center',
    width: '88%',
    borderRadius: 8,
    backgroundColor: ORANGE,
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  dashboardText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
  checkStatusBtn: {
    alignSelf: 'center',
    width: '88%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  checkStatusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
  loginBtn: {
    alignSelf: 'center',
    width: '88%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ORANGE,
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: width * 0.045,
  },
  backToLoginContainer: {
    alignSelf: 'center',
    paddingVertical: height * 0.015,
    marginTop: height * 0.01,
  },
  backToLoginText: {
    color: '#E9DFF4',
    fontSize: width * 0.038,
    fontWeight: '600',
    textAlign: 'center',
  },
});
