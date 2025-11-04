// import { View, Text } from 'react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import AppNavigation from './src/navigation/AppNavigation';
import CustomToast from './src/component/CustomToast';
// import MyServices from './src/screens/main_screens/MyServices';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import AccountSetting from './src/screens/main_screens/AccountSetting';
import LiveStreamScreen from './src/screens/livestream/LiveStream';
import AvailabilityManagement from './src/screens/main_screens/AvailabilityManagement';
import { AuthProvider } from './src/contexts';
import { RegistrationProvider } from './src/contexts';

const App = () => {
  const toastConfig = {
    customToast: props => <CustomToast {...props} />,
  };

  return (
    <SafeAreaProvider style={{ flex: 1,alignContent:'center' }}>
     <AuthProvider>
      <RegistrationProvider>
          <AppNavigation />
      </RegistrationProvider>
    </AuthProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
};

export default App;
