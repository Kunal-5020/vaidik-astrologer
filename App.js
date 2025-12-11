// App.js (ASTROLOGER APP - FIXED: Removed Full Screen Notification Config)
import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Platform, Alert, DeviceEventEmitter, PermissionsAndroid, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setNavigationRef } from './src/services/api/axios.instance';

import AppNavigation from './src/navigation/AppNavigation';
import CustomToast from './src/component/CustomToast';
import { AuthProvider } from './src/contexts';
import { RegistrationProvider } from './src/contexts';
import astrologerAuthService from './src/services/api/auth.service';
import IncomingChatRequestModal from './src/component/IncomingChatRequestModal';
import IncomingCallModal from './src/component/IncomingCallModal';
import GiftNotificationModal from './src/component/GiftNotificationModal';
import notificationSocket from './src/services/NotificationSocket';
import { STORAGE_KEYS } from './src/config/constants';
import { storageService } from './src/services/storage/storage.service';
import ChatService from './src/services/api/chat/ChatService';
import AstrologerChatSocket from './src/services/socket/AstrologerChatSocket';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { CallService } from './src/services/api/call/CallService';

/** TYPE CONFIG - UPDATED: Removed fullScreen: true */
const getNotificationConfig = (type) => {
  const configs = {
    // Changed fullScreen to false and behavior to banner/modal
    chat_request: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    call_request_audio: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    call_request_video: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    chat_message: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'context-aware' },
    gift_received: { priority: 'urgent', sound: 'gift_received', fullScreen: false, foregroundBehavior: 'gift-modal' },
    request_accepted: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    request_rejected: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    request_expired: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    added_to_queue: { priority: 'medium', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    queue_update: { priority: 'medium', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    your_turn: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    session_ending: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    session_ended: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    low_balance: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    payment_success: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    earnings_credited: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    payout_processed: { priority: 'high', sound: 'default', fullScreen: false, foregroundBehavior: 'banner' },
    force_logout: { priority: 'urgent', sound: 'default', fullScreen: false, foregroundBehavior: 'modal' },
    promotional: { priority: 'medium', sound: 'default', fullScreen: false, foregroundBehavior: 'toast' },
  };

  return configs[type] || {
    priority: 'medium',
    sound: 'default',
    fullScreen: false,
    foregroundBehavior: 'banner',
  };
};

/** BACKGROUND HANDLER: Cleaned up fullScreen logic */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 [Background] Message received:', remoteMessage.notification?.title);
  const data = remoteMessage.data || {};
  
  // Removed isFullScreen check logic

  try {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Notification',
      body: remoteMessage.notification?.body || '',
      data,
      android: {
        channelId: 'vaidik_talk_notifications',
        importance: AndroidImportance.HIGH,
        // Removed category CALL to prevent full screen intent triggering attempts if handled by system
        sound: 'default',
        pressAction: { id: 'default' },
      },
    });
    console.log('✅ [Background] Notification displayed');
  } catch (error) {
    console.error('❌ [Background] Failed:', error);
  }
});

const AppContent = () => {
  const navigationRef = useRef(null);
  const unsubscriptionsRef = useRef([]);
  const appState = useRef(AppState.currentState);
  const currentRoute = useRef(null);

  const [incomingChatRequest, setIncomingChatRequest] = useState(null);
  const [incomingCallRequest, setIncomingCallRequest] = useState(null);
  const [giftNotification, setGiftNotification] = useState(null);
  const [bannerNotification, setBannerNotification] = useState(null);

  const toastConfig = {
    customToast: (props) => <CustomToast {...props} />,
  };

  /** Helper: map Firebase RemoteMessage -> internal notification */
  const mapRemoteToInternal = (remoteMessage) => {
    const data = remoteMessage?.data || {};
    const notificationType = data.type;

    console.log('🧾 [MapRemote] data:', data);

    return {
      notificationId: data.notificationId || `notif_${Date.now()}`,
      type: notificationType,
      title: remoteMessage?.notification?.title || '',
      message: remoteMessage?.notification?.body || '',
      body: remoteMessage?.notification?.body || '',
      data,
      timestamp: new Date().toISOString(),
    };
  };

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
      console.log('✅ [App] Navigation ref set');
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
      console.log('📱 [AppState] Changed to:', nextAppState);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const route = navigationRef.current?.getCurrentRoute();
      currentRoute.current = route?.name;
      console.log('📍 [Navigation] Current route:', route?.name);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔥 [App] Initializing...');

        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          console.warn('⚠️ Notifications disabled');
        }

        await createNotificationChannel();
        astrologerAuthService.setupFCMTokenRefreshListener();
        setupNotificationHandlers();
        await connectNotificationSocket();

        console.log('✅ [App] Initialization complete');
      } catch (error) {
        console.error('❌ [App] Initialization error:', error.message);
      }
    };

    initializeApp();

    return () => {
      console.log('🧹 [App] Cleaning up...');
      unsubscriptionsRef.current.forEach((unsubscribe) => typeof unsubscribe === 'function' && unsubscribe());
      astrologerAuthService.cleanup();
      notificationSocket.disconnect();
    };
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (err) {
      console.error('❌ Permission error:', err);
      return false;
    }
  };

  const connectNotificationSocket = async () => {
    try {
      const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const deviceId = await AsyncStorage.getItem('deviceId');

      if (token && deviceId) {
        await notificationSocket.connect(token, deviceId, 'astrologer');

        notificationSocket.on('new-notification', (notification) => {
          console.log('📩 [Socket] Notification:', notification.type);
          handleNotification(notification);
        });
      }
    } catch (error) {
      console.error('❌ [Socket] Connection failed:', error);
    }
  };

  const createNotificationChannel = async () => {
    try {
      await notifee.createChannel({
        id: 'vaidik_talk_notifications',
        name: 'Vaidik Talk Notifications',
        importance: AndroidImportance.HIGH,
        lights: true,
        vibration: true,
        sound: 'default',
      });
      console.log('✅ [Channel] Created');
    } catch (error) {
      console.error('❌ [Channel] Failed:', error.message);
    }
  };

  /** Central notification handler */
  const handleNotification = (notification) => {
    const { type, data } = notification;
    const config = getNotificationConfig(type);

    console.log('🔔 [Handler] Type:', type);
    console.log('🔔 [Handler] Behavior:', config.foregroundBehavior);
    console.log('🔔 [Handler] Data:', data);

    switch (type) {
      case 'chat_request':
        console.log('📥 [ChatRequest] Setting incomingChatRequest');
        // We still set this state to show the In-App Modal (UI)
        // But the System Full Screen Notification is disabled via config
        setIncomingChatRequest({
          orderId: data.orderId,
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName,
          userProfilePic: data.userProfilePic,
          userQuestion: data.userQuestion,
          ratePerMinute: data.ratePerMinute || 10,
        });
        break;

      case 'call_request_audio':
      case 'call_request_video':
        setIncomingCallRequest({
          orderId: data.orderId,
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName,
          callType: type === 'call_request_video' ? 'video' : 'audio',
          ratePerMinute: data.ratePerMinute || 15,
        });
        break;

      case 'chat_message':
        handleChatMessage(notification);
        break;

      case 'gift_received':
        handleGiftReceived(notification);
        break;

      case 'earnings_credited':
      case 'payment_success':
      case 'payout_processed':
      case 'session_ending':
      case 'session_ended':
        setBannerNotification({
          title: notification.title,
          body: notification.message || notification.body,
          data,
          type,
        });
        break;

      case 'force_logout':
        handleForceLogout();
        break;

      default:
        console.log('ℹ️ [Handler] Unhandled type:', type);
    }
  };

  const handleChatMessage = (notification) => {
    const { data } = notification;
    const inChatScreen = currentRoute.current === 'AstroChatRoom';
    const isActive = appState.current === 'active';

    console.log('💬 [ChatMessage] In chat screen?', inChatScreen);
    console.log('💬 [ChatMessage] App active?', isActive);

    if (inChatScreen && isActive) {
      console.log('✅ [ChatMessage] Already in chat - no notification');
      return;
    }

    if (isActive && !inChatScreen) {
      console.log('📬 [ChatMessage] Show in-app banner');
      setBannerNotification({
        title: data.senderName || 'New Message',
        body: notification.message || notification.body,
        data,
        type: 'chat_message',
      });
      return;
    }

    console.log('📲 [ChatMessage] Background - handled by system');
  };

  const handleGiftReceived = (notification) => {
    const { data } = notification;
    const inChatScreen = currentRoute.current === 'AstroChatRoom';
    const isActive = appState.current === 'active';

    console.log('🎁 [Gift] Received:', data.giftName);

    if (inChatScreen && isActive) {
      DeviceEventEmitter.emit('gift-received-in-chat', {
        giftImage: data.giftImage,
        giftName: data.giftName,
        giftValue: data.giftValue,
        message: data.message,
        senderName: data.senderName,
      });
      return;
    }

    setGiftNotification({
      giftImage: data.giftImage,
      giftName: data.giftName,
      giftValue: data.giftValue,
      message: data.message,
      senderName: data.senderName,
      sessionId: data.sessionId,
    });
  };

  const handleAcceptChat = async () => {
    if (!incomingChatRequest) return;

    try {
      console.log('✅ [Chat] Accepting:', incomingChatRequest.sessionId);

      let astrologerJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
      if (!astrologerJson) astrologerJson = await AsyncStorage.getItem('astrologer');

      const astrologer = astrologerJson ? JSON.parse(astrologerJson) : null;
      const astrologerId = astrologer?._id || astrologer?.id;

      if (!astrologerId) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      const res = await ChatService.acceptChatAsAstrologer(incomingChatRequest.sessionId);
      console.log('✅ [Chat] Backend accept response:', res);

      // Ensure socket is connected before navigating
      await AstrologerChatSocket.connect();

      setIncomingChatRequest(null);

      if (navigationRef.current) {
        console.log('➡️ [Chat] Navigating to AstroChatRoom');
        navigationRef.current.navigate('AstroChatRoom', {
          sessionId: incomingChatRequest.sessionId,
          orderId: incomingChatRequest.orderId,
          userId: incomingChatRequest.userId,
          userName: incomingChatRequest.userName,
        });
      } else {
        console.warn('⚠️ [Chat] navigationRef is null');
      }
    } catch (error) {
      console.error('❌ [Chat] Accept failed:', error);
      Alert.alert('Error', error.message || 'Failed to accept chat');
    }
  };

  const handleRejectChat = () => {
    console.log('❌ [Chat] Rejected');
    setIncomingChatRequest(null);
    // TODO: Call API to reject if needed
  };

  const handleAcceptCall = async () => {
    if (!incomingCallRequest) return;

    try {
      console.log('✅ [Call] Accepting:', incomingCallRequest.sessionId);

      await CallService.acceptCall(incomingCallRequest.sessionId);

      setIncomingCallRequest(null);

      if (navigationRef.current) {
        navigationRef.current.navigate('CallScreen', {
          sessionId: incomingCallRequest.sessionId,
          orderId: incomingCallRequest.orderId,
          userId: incomingCallRequest.userId,
          userName: incomingCallRequest.userName,
          callType: incomingCallRequest.callType,
        });
      }
    } catch (error) {
      console.error('❌ [Call] Accept failed:', error);
      Alert.alert('Error', error.message || 'Failed to accept call');
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCallRequest) return;
    console.log('❌ [Call] Rejected:', incomingCallRequest.sessionId);

    try {
      await CallService.rejectCall(incomingCallRequest.sessionId, 'astrologer_rejected');
    } catch (e) {
      console.error('❌ [Call] Reject error:', e);
    }

    setIncomingCallRequest(null);
  };

  const handleForceLogout = async () => {
    try {
      console.log('🚪 [ForceLogout] Logging out...');

      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.ASTROLOGER_DATA,
        'fcm_token',
        'deviceId',
      ]);

      notificationSocket.disconnect();
      AstrologerChatSocket.disconnect();
      await notifee.cancelAllNotifications();

      Alert.alert(
        'Logged Out',
        'You have been logged out because you signed in from another device.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigationRef.current) {
                navigationRef.current.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('❌ [ForceLogout] Error:', error);
    }
  };

  const setupNotificationHandlers = () => {
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('📩 [Foreground] Received:', remoteMessage.notification?.title);

      if (remoteMessage.data?.type === 'force_logout') {
        handleForceLogout();
        return;
      }

      const notification = mapRemoteToInternal(remoteMessage);

      handleNotification(notification);
      DeviceEventEmitter.emit('notification-received', notification);
    });

    unsubscriptionsRef.current.push(unsubscribeForeground);

    // Background tap
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📲 [Background] Tapped');

      if (!remoteMessage) return;

      if (remoteMessage.data?.type === 'force_logout') {
        handleForceLogout();
        return;
      }

      const notification = mapRemoteToInternal(remoteMessage);
      handleNotification(notification);
    });

    // Quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (!remoteMessage) return;

        console.log('📲 [Quit State] Opened from notification');

        if (remoteMessage.data?.type === 'force_logout') {
          handleForceLogout();
          return;
        }

        const notification = mapRemoteToInternal(remoteMessage);
        handleNotification(notification);
      })
      .catch((error) => console.error('❌ [Initial notification] Error:', error));

    console.log('✅ [Handlers] Setup complete');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
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

        {/* Kept In-App Modals for answering calls/chats */}
        <IncomingChatRequestModal
          visible={!!incomingChatRequest}
          request={incomingChatRequest}
          onAccept={handleAcceptChat}
          onReject={handleRejectChat}
        />

        <IncomingCallModal
          visible={!!incomingCallRequest}
          callData={incomingCallRequest}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />

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

const App = () => <AppContent />;

export default App;