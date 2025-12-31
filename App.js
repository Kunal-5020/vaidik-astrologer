import React, { useRef, useState } from 'react';
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

// Import New Logic & Services
import { SessionProvider, useSession } from './src/contexts/SessionContext';
import ActiveSessionBar from './src/component/ActiveSessionBar';
import { notificationManager } from './src/services/notification/NotificationManager';
import { useAppLogic } from './src/hooks/useAppLogic';

// UI Components
import IncomingChatRequestModal from './src/component/IncomingChatRequestModal';
import IncomingCallModal from './src/component/IncomingCallModal';
import GiftNotificationModal from './src/component/GiftNotificationModal';

// --- BACKGROUND HANDLER ---
// This handles notifications when app is Quit or in Background
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 [Background] Message:', remoteMessage.notification?.title);
  
  try {
    // Ensure channels exist before displaying
    await notificationManager.setup();
    
    const type = remoteMessage.data?.type;
    // Check type and call appropriate display function
    if (type?.includes('call_request') || type === 'chat_request') {
      await notificationManager.displayRequestNotification(remoteMessage.data);
    } else if (type === 'chat_message') {
      await notificationManager.displayChatNotification(remoteMessage.data);
    }
  } catch (error) {
    console.error('❌ [Background] Error:', error);
  }
});

// ✅ Helper to find current route name (Handles nested navigators like Tabs)
const getActiveRouteName = (state) => {
  if (!state || !state.routes) return null;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state); // Dive deeper
  }
  return route.name;
};

const AppContent = () => {
  const navigationRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Use the custom hook for all business logic
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

  const shouldHideBar = currentRoute === 'CallScreen' || currentRoute === 'AstroChatRoom';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>

        <SessionProvider>
          <NavigationContainer
            ref={(ref) => {
              navigationRef.current = ref;
              setNavigationRef(ref);
            }}
            onReady={() => console.log('✅ [App] Navigation ready')}
            onStateChange={(state) => {
              const routeName = getActiveRouteName(state);
              setCurrentRoute(routeName);
            }}
          >
          <AuthProvider>
            <RegistrationProvider>
              <NotificationProvider navigation={navigationRef.current}>
                <AppNavigation />
                {!shouldHideBar && <ActiveSessionBar />}
              </NotificationProvider>
            </RegistrationProvider>
          </AuthProvider>
        </NavigationContainer>

        {/* --- GLOBAL MODALS --- */}
        
        {/* Chat Request */}
        <IncomingChatRequestModal
          visible={!!incomingChatRequest}
          request={incomingChatRequest}
          onAccept={handleAcceptChat}
          onReject={handleRejectChat}
        />

        {/* Incoming Call (Full Screen UI) */}
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
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App = () => <AppContent />;

export default App;