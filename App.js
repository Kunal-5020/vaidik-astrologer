// App.js (COMPLETE - with correct structure)
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { setNavigationRef } from './src/services/api/axios.instance';

import AppNavigation from './src/navigation/AppNavigation';
import CustomToast from './src/component/CustomToast';
import { AuthProvider } from './src/contexts';
import { RegistrationProvider } from './src/contexts';
import astrologerAuthService from './src/services/api/auth.service';

const App = () => {
  const navigationRef = useRef(null);
  const unsubscriptionsRef = useRef([]);

  const toastConfig = {
    customToast: props => <CustomToast {...props} />,
  };

  // ✅ Set navigation ref for axios interceptor
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
      console.log('✅ [App] Navigation ref set for axios');
    }
  }, []);

  // ✅ Firebase initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔥 [App] Starting Firebase initialization...');

        console.log('📢 [App] Creating notification channel...');
        await createNotificationChannel();

        console.log('🔄 [App] Setting up FCM refresh listener...');
        astrologerAuthService.setupFCMTokenRefreshListener();

        console.log('📲 [App] Setting up notification handlers...');
        setupNotificationHandlers();

        console.log('✅ [App] Firebase initialization complete');
      } catch (error) {
        console.error('❌ [App] Firebase initialization error:', {
          message: error.message,
          code: error.code,
        });
      }
    };

    initializeApp();

    return () => {
      console.log('🧹 [App] Cleaning up listeners...');
      
      unsubscriptionsRef.current.forEach((unsubscribe) => {
        try {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch (error) {
          console.error('❌ [App] Error during cleanup:', error);
        }
      });
      
      astrologerAuthService.cleanup();
      console.log('✅ [App] All listeners cleaned up');
    };
  }, []);

  const createNotificationChannel = async () => {
    if (Platform.OS !== 'android') {
      console.log('ℹ️  [Channel] Not Android, skipping');
      return;
    }

    try {
      await notifee.createChannel({
        id: 'vaidik_talk_notifications',
        name: 'Vaidik Talk Notifications',
        description: 'Notifications from Vaidik Talk app',
        importance: AndroidImportance.HIGH,
        lights: true,
        vibration: true,
        sound: 'default',
        lightColor: '#FF5722',
      });
      console.log('✅ [Channel] Created successfully');
    } catch (error) {
      console.error('❌ [Channel] Creation failed:', error.message);
    }
  };

  const setupNotificationHandlers = () => {
    console.log('📲 [Handlers] Setting up...');

    // Foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('📩 [Foreground] Received:', remoteMessage.notification?.title);

      if (remoteMessage.notification) {
        try {
          await notifee.displayNotification({
            title: remoteMessage.notification.title || 'Vaidik Talk',
            body: remoteMessage.notification.body || 'You have a new notification',
            data: remoteMessage.data,
            android: {
              channelId: 'vaidik_talk_notifications',
              importance: AndroidImportance.HIGH,
              pressAction: { id: 'default' },
              sound: 'default',
              color: '#FF5722',
            },
            ios: { sound: 'default' },
          });
          console.log('✅ [Foreground] Displayed');
        } catch (error) {
          console.error('❌ [Foreground] Failed:', error.message);
        }
      }
    });
    unsubscriptionsRef.current.push(unsubscribeForeground);

    // Notification opened
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📲 [NotificationOpened] Tapped:', remoteMessage.notification?.title);
    });
    unsubscriptionsRef.current.push(unsubscribeNotificationOpened);

    // Initial notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📲 [Initial] From quit state');
        } else {
          console.log('ℹ️  [Initial] Normal start');
        }
      })
      .catch((error) => console.error('❌ [Initial] Error:', error));

    // Notifee foreground event
    const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('📲 [NotifeePress] Pressed');
      } else if (type === EventType.DISMISS) {
        console.log('❌ [NotifeeDismiss] Dismissed');
      }
    });
    unsubscriptionsRef.current.push(unsubscribeNotifeeForeground);

    console.log('✅ [Handlers] Setup complete');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        {/* ✅ SINGLE NavigationContainer here */}
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => {
            console.log('✅ [App] Navigation ready');
          }}
        >
          {/* ✅ Providers wrap only AppNavigation */}
          <AuthProvider>
            <RegistrationProvider>
              <AppNavigation />
            </RegistrationProvider>
          </AuthProvider>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
