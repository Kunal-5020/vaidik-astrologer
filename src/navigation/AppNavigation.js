// src/navigation/AppNavigation.js (CORRECTED)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CardStyleInterpolators } from '@react-navigation/stack';

// Screens
import RootTabNavigator from './RootTabNavigation';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Registration Screens
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
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      {/* ✅ Splash & Auth Screens */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          animationEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="OTP" 
        component={OTPScreen}
        options={{
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      {/* ✅ Registration Flow */}
      <Stack.Screen 
        name="RegisterPhone" 
        component={PhoneNumberScreen}
        options={{
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="RegisterOTP" 
        component={OtpVerificationScreen}
        options={{
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      
      <Stack.Screen 
        name="RegisterForm" 
        component={RegistrationFormScreen}
        options={{
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="ThankYou" 
        component={ThankYouScreen}
        options={{
          animationEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="CheckStatus" 
        component={CheckStatusScreen}
        options={{
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="InterviewDashboard" 
        component={InterviewDashboardScreen}
        options={{
          animationEnabled: true,
        }}
      />

      {/* ✅ Main App (Authenticated) */}
      <Stack.Screen 
        name="Home" 
        component={RootTabNavigator}
        options={{
          animationEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="GoLiveSetup" 
        component={GoLiveSetupScreen}
        options={{
          headerShown: true,
          title: 'Go Live Setup',
          headerBackTitle: 'Cancel',
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      
      <Stack.Screen 
        name="StreamAnalytics" 
        component={StreamAnalyticsScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="MyStreams" 
        component={MyStreamsScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="Go-Live" 
        component={LiveStreamScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      
      <Stack.Screen 
        name="Services" 
        component={MyServicesScreen}
        options={{
          headerShown: true,
          title: 'My Services',
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="Setting" 
        component={AccountSetting}
        options={{
          headerShown: true,
          title: 'Account Settings',
          animationEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="Availability" 
        component={AvailabilityManagement}
        options={{
          headerShown: true,
          title: 'Availability',
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigation;
