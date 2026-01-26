// src/navigation/AppNavigation.js
import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// Screens
import RootTabNavigator from './RootTabNavigation';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Registration Screens
import PhoneNumberScreen from '../screens/registration/PhoneNumberScreen';
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
import AstroChatRoom from '../screens/CallChatSection/AstroChatRoom';
import CallScreen from '../screens/CallChatSection/CallScreen';
import WalletWithdrawScreen from '../screens/wallet/WalletWithdrawScreen';
import HelpSupportScreen from '../screens/main_screens/HelpAndSupport';
import NotificationsScreen from '../screens/main_screens/NotificationScreen';
import PerformanceAnalysisScreen from '../screens/main_screens/PerformanceAnalysis';
import PayoutRequestsScreen from '../screens/wallet/PayoutRequestsScreen';
import PayoutDetailsScreen from '../screens/wallet/PayoutDetailsScreen';
import AddBankAccountScreen from '../screens/wallet/AddBankAccountScreen';
import AstroHistoryChatScreen from '../screens/CallChatSection/AstroHistoryChatScreen';
import SuggestRemediesScreen from '../screens/CallChatSection/SuggestRemediesScreen';
import AstrologerReviewsScreen from '../screens/CallChatSection/AstrologerReviewsScreen';
import AstrologerSuggestedRemediesScreen from '../screens/CallChatSection/AstrologerSuggestedRemediesScreen';
import MediaViewer from '../screens/CallChatSection/MediaViewer';

const Stack = createStackNavigator();

// ==============================
// 🎨 HEADER THEME CONFIGURATION
// ==============================

// 1. Purple Header (Brand Color) - White Text & Back Arrow
const purpleHeaderOptions = {
  headerStyle: {
    backgroundColor: '#372643',
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerTintColor: '#ffffff', // Back arrow and Title color
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 18,
  },
  headerBackTitleVisible: false, // Hide "Back" text on iOS
};

// 2. White Header - Purple Text & Back Arrow
const whiteHeaderOptions = {
  headerStyle: {
    backgroundColor: '#ffffff',
    elevation: 4, // Add slight shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  headerTintColor: '#372643', // Purple text
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 18,
  },
  headerBackTitleVisible: false,
};

// 3. Yellow Header (Accent) - Purple Text
const yellowHeaderOptions = {
  headerStyle: {
    backgroundColor: '#FFD700', // Gold/Yellow
    elevation: 0,
  },
  headerTintColor: '#372643', // Purple text for contrast
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerBackTitleVisible: false,
};

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
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />

      {/* ✅ Registration Flow */}
      <Stack.Screen name="RegisterPhone" component={PhoneNumberScreen} />
      <Stack.Screen name="RegisterForm" component={RegistrationFormScreen} />
      <Stack.Screen name="ThankYou" component={ThankYouScreen} />
      <Stack.Screen name="CheckStatus" component={CheckStatusScreen} />
      <Stack.Screen name="InterviewDashboard" component={InterviewDashboardScreen} />

      {/* ✅ Communication Screens */}
      <Stack.Screen name="AstroChatRoom" component={AstroChatRoom} />
      <Stack.Screen name="AstroHistoryChat" component={AstroHistoryChatScreen} />
      <Stack.Screen name="MediaViewer" component={MediaViewer} />
      <Stack.Screen name="SuggestRemedies" component={SuggestRemediesScreen} />
      
      <Stack.Screen 
        name="AstrologerReviews" 
        component={AstrologerReviewsScreen}
        options={{ 
          headerShown: true, 
          title: 'Reviews',
          ...whiteHeaderOptions // Applying Purple Theme
        }}
      />

      <Stack.Screen name="AstrologerSuggestedRemedies" component={AstrologerSuggestedRemediesScreen} />
      <Stack.Screen 
  name="CallScreen" 
  component={CallScreen}
  options={{
    headerShown: false,
    gestureEnabled: false, // 👈 DISABLE SWIPE BACK
  }}
/>

      {/* ✅ Main App (Authenticated) */}
      <Stack.Screen name="Home" component={RootTabNavigator} />
      
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          headerShown: true, 
          title: 'Edit Profile',
          ...purpleHeaderOptions // Applying Purple Theme
        }}
      />
      
      <Stack.Screen 
        name="GoLiveSetup" 
        component={GoLiveSetupScreen}
        options={{
          headerShown: true,
          title: 'Go Live Setup',
          ...purpleHeaderOptions,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      
      <Stack.Screen 
        name="StreamAnalytics" 
        component={StreamAnalyticsScreen}
        options={{ 
          headerShown: true,
          title: 'Stream Analytics',
          ...yellowHeaderOptions,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
           }} />

      <Stack.Screen name="MyStreams" component={MyStreamsScreen} />
      
      <Stack.Screen 
        name="Go-Live" 
        component={LiveStreamScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      />
      
      <Stack.Screen 
        name="Services" 
        component={MyServicesScreen}
        options={{ 
          headerShown: true, 
          title: 'My Services',
          ...purpleHeaderOptions 
        }}
      />
      
      <Stack.Screen 
        name="Setting" 
        component={AccountSetting}
        options={{ 
          headerShown: true, 
          title: 'Account Settings',
          ...purpleHeaderOptions 
        }}
      />
      
      <Stack.Screen 
        name="Availability" 
        component={AvailabilityManagement}
        options={{ 
          headerShown: true, 
          title: 'Availability',
          ...purpleHeaderOptions 
        }}
      />

      {/* ✅ Wallet & Finance */}
      <Stack.Screen 
        name="WalletWithdraw" 
        component={WalletWithdrawScreen}
        options={{ 
          headerShown: true, 
          title: 'Withdraw Funds',
          ...purpleHeaderOptions 
        }}
      />

      <Stack.Screen 
        name="AddBankAccount" 
        component={AddBankAccountScreen}
        options={{ 
          headerShown: true, 
          title: 'Add Bank Account',
          ...purpleHeaderOptions // Example: White header for forms
        }}
      />
      
      <Stack.Screen 
        name="PayoutRequests" 
        component={PayoutRequestsScreen}
        options={{ 
          headerShown: true, 
          title: 'Payout Requests',
          ...purpleHeaderOptions 
        }}
      />

      <Stack.Screen 
        name="PayoutDetails" 
        component={PayoutDetailsScreen}
        options={{ 
          headerShown: true, 
          title: 'Transaction Details',
          ...purpleHeaderOptions 
        }}
      />

      {/* ✅ Support & Other */}
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen}
        options={{ 
          headerShown: true, 
          title: 'Help & Support',
          ...purpleHeaderOptions 
        }}
      />

      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="PerformanceAnalysis" 
        component={PerformanceAnalysisScreen}
        options={{ 
          headerShown: true, 
          title: 'Performance Analysis',
          ...purpleHeaderOptions 
        }}
      />

    </Stack.Navigator>
  );
};

export default AppNavigation;