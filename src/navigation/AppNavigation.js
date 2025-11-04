import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider, RegistrationProvider } from '../contexts';

// Existing Screens
import RootTabNavigator from './RootTabNavigation';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// NEW Registration Screens
import PhoneNumberScreen from '../screens/registration/PhoneNumberScreen';
import OtpVerificationScreen from '../screens/registration/OtpVerificationScreen';
import RegistrationFormScreen from '../screens/registration/RegistrationFormScreen';
import ThankYouScreen from '../screens/registration/ThankYouScreen';
import CheckStatusScreen from '../screens/registration/CheckStatusScreen';
import InterviewDashboardScreen from '../screens/registration/InterviewDashboardScreen';

// Main Screens
import EditProfileScreen from '../screens/main_screens/EditProfileScreen';
import LiveStreamScreen from '../screens/livestream/LiveStream';
import MyServicesScreen from '../screens/main_screens/MyServices';
import AccountSetting from '../screens/main_screens/AccountSetting';
import AvailabilityManagement from '../screens/main_screens/AvailabilityManagement';
import GoLiveSetupScreen from '../screens/livestream/GoLiveSetupScreen';
import StreamAnalyticsScreen from '../screens/livestream/StreamAnalyticsScreen';
import MyStreamsScreen from '../screens/livestream/MyStreamsScreen';

const Stack = createStackNavigator();

const AppNavigation = () => {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          >
            {/* Splash & Auth */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />

            {/* NEW: Registration Flow */}
            <Stack.Screen name="RegisterPhone" component={PhoneNumberScreen} />
            <Stack.Screen name="RegisterOTP" component={OtpVerificationScreen} />
            <Stack.Screen name="RegisterForm" component={RegistrationFormScreen} />
            <Stack.Screen name="ThankYou" component={ThankYouScreen} />
            <Stack.Screen name="CheckStatus" component={CheckStatusScreen} />
            <Stack.Screen name="InterviewDashboard" component={InterviewDashboardScreen} />

            {/* Main App */}
            <Stack.Screen name="Home" component={RootTabNavigator} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen 
  name="GoLiveSetup" 
  component={GoLiveSetupScreen}
  options={{ 
    headerShown: true,
    title: 'Go Live Setup',
    headerBackTitle: 'Cancel'
  }}
/>
<Stack.Screen 
  name="StreamAnalytics" 
  component={StreamAnalyticsScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen 
  name="MyStreams" 
  component={MyStreamsScreen}
  options={{ headerShown: false }}
/>

            <Stack.Screen name="Go-Live" component={LiveStreamScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Services" component={MyServicesScreen} />
            <Stack.Screen name="Setting" component={AccountSetting} />
            <Stack.Screen name="Avability" component={AvailabilityManagement} />
          </Stack.Navigator>
        </NavigationContainer>
      </RegistrationProvider>
    </AuthProvider>
  );
};

export default AppNavigation;
