// App.js
import React, { useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

import AppNavigation from './src/navigation/AppNavigation';
import CustomToast from './src/component/CustomToast';
import { AuthProvider, RegistrationProvider } from './src/contexts';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { setNavigationRef } from './src/services/api/axios.instance';
import { notificationManager } from './src/services/notification/NotificationManager';
import { useAppLogic } from './src/hooks/useAppLogic';

// UI Components
import IncomingChatRequestModal from './src/component/IncomingChatRequestModal';
import IncomingCallModal from './src/component/IncomingCallModal';
import GiftNotificationModal from './src/component/GiftNotificationModal';

// --- BACKGROUND HANDLER (Must be at top level) ---
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 [Background] Message:', remoteMessage.notification?.title);
  await notificationManager.setup(); // Ensure channels exist
  await notificationManager.displayNotification(remoteMessage);
});

const AppContent = () => {
  const navigationRef = useRef(null);

  // Hook handles all logic, state, and notification events
  const {
    incomingChatRequest,
    incomingCallRequest,
    giftNotification,
    setGiftNotification,
    handleAcceptCall,
    handleRejectCall,
    handleAcceptChat,
    handleRejectChat,
  } = useAppLogic(navigationRef);

  const toastConfig = {
    customToast: (props) => <CustomToast {...props} />,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <NavigationContainer
          ref={(ref) => {
            navigationRef.current = ref;
            setNavigationRef(ref); // Axios interceptor ref
          }}
          onReady={() => console.log('✅ [App] Navigation ready')}
        >
          <AuthProvider>
            <RegistrationProvider>
              <NotificationProvider navigation={navigationRef.current}>
                <AppNavigation />
              </NotificationProvider>
            </RegistrationProvider>
          </AuthProvider>
        </NavigationContainer>

        {/* --- GLOBAL MODALS --- */}
        
        {/* Chat Request Modal */}
        <IncomingChatRequestModal
          visible={!!incomingChatRequest}
          request={incomingChatRequest}
          onAccept={handleAcceptChat}
          onReject={handleRejectChat}
        />

        {/* Call Request Modal (Acts as Full Screen UI when App Wakes) */}
        <IncomingCallModal
          visible={!!incomingCallRequest}
          callData={incomingCallRequest}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />

        {/* Gift Modal */}
        <GiftNotificationModal
          visible={!!giftNotification}
          gift={giftNotification}
          onDismiss={() => setGiftNotification(null)}
          onViewInChat={() => {
            const sessionId = giftNotification?.sessionId;
            setGiftNotification(null);
            if (sessionId && navigationRef.current) {
              navigationRef.current.navigate('AstroChatRoom', { sessionId });
            }
          }}
        />

        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default function App() {
  return <AppContent />;
}