import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PhoneNumberScreen from '../screens/registration/PhoneNumberScreen';
import OtpVerificationScreen from '../screens/registration/OtpVerificationScreen';
import RegistrationFormScreen from '../screens/registration/RegistrationFormScreen';
import ThankYouScreen from '../screens/registration/ThankYouScreen';
import CheckStatusScreen from '../screens/registration/CheckStatusScreen';

const Stack = createStackNavigator();

export default function RegistrationNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="RegistrationForm" component={RegistrationFormScreen} />
      <Stack.Screen name="ThankYou" component={ThankYouScreen} />
      <Stack.Screen name="CheckStatus" component={CheckStatusScreen} />
    </Stack.Navigator>
  );
}
