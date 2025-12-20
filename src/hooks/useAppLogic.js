// src/hooks/useAppLogic.js
import { useEffect, useState, useRef } from 'react';
import { AppState, DeviceEventEmitter, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { notificationManager } from '../services/notification/NotificationManager';
import astrologerAuthService from '../services/api/auth.service';
import notificationSocket from '../services/NotificationSocket';
import AstrologerChatSocket from '../services/socket/AstrologerChatSocket';
import { STORAGE_KEYS } from '../config/constants';
import { storageService } from '../services/storage/storage.service';
import ChatService from '../services/api/chat/ChatService';
import { CallService } from '../services/api/call/CallService';

export const useAppLogic = (navigationRef) => {
  // --- STATE ---
  const [incomingChatRequest, setIncomingChatRequest] = useState(null);
  const [incomingCallRequest, setIncomingCallRequest] = useState(null);
  const [giftNotification, setGiftNotification] = useState(null);
  
  const appState = useRef(AppState.currentState);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      console.log('🔥 [AppLogic] Initializing...');
      
      // 1. Setup Notification Channels & Permissions
      notificationManager.setNavigation(navigationRef.current);
      await notificationManager.setup();

      // 2. Connect Socket
      const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (token && deviceId) {
        await notificationSocket.connect(token, deviceId, 'astrologer');
        notificationSocket.on('new-notification', handleSocketNotification);
      }

      // 3. Auth Listeners
      astrologerAuthService.setupFCMTokenRefreshListener();

      // 4. Check for Initial Notification (App Launched from Dead State)
      const initialNotif = await notifee.getInitialNotification();
      if (initialNotif) {
        handleNotificationInteraction(initialNotif);
      }
    };

    init();

    return () => {
      astrologerAuthService.cleanup();
      notificationSocket.disconnect();
    };
  }, []);

  // --- LISTENERS ---
  useEffect(() => {
    // Foreground FCM
    const unsubFCM = messaging().onMessage(async (remoteMessage) => {
      console.log('📩 [Foreground] received:', remoteMessage);
      handleIncomingData(remoteMessage.data);
      
      // Don't show system notification if we are already in the chat screen
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      const isChatting = currentRoute === 'AstroChatRoom' && remoteMessage.data?.type === 'chat_message';
      
      if (!isChatting) {
        await notificationManager.displayNotification(remoteMessage);
      }
    });

    // Foreground/Background Interactions (Taps/Buttons)
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        handleNotificationInteraction(detail);
      }
    });

    // Background App Open
    const unsubOpen = messaging().onNotificationOpenedApp((msg) => {
      handleNotificationInteraction({ notification: msg });
    });

    return () => {
      unsubFCM();
      unsubNotifee();
      unsubOpen();
    };
  }, []);

  // --- HANDLERS ---

  const handleSocketNotification = (notification) => {
    console.log('⚡ [Socket] Received:', notification.type);
    handleIncomingData(notification.data || notification);
  };

  const handleIncomingData = (data) => {
    if (!data) return;
    const type = data.type;

    switch (type) {
      case 'chat_request':
        setIncomingChatRequest({ ...data, ratePerMinute: data.ratePerMinute || 10 });
        break;
      case 'call_request_audio':
      case 'call_request_video':
        setIncomingCallRequest({ 
          ...data, 
          callType: type.includes('video') ? 'video' : 'audio',
          ratePerMinute: data.ratePerMinute || 15 
        });
        break;
      case 'gift_received':
        setGiftNotification(data);
        break;
      case 'force_logout':
        handleForceLogout();
        break;
    }
  };

  const handleNotificationInteraction = (detail) => {
    const { notification, pressAction } = detail;
    const data = notification?.data || {};
    const type = data.type;

    console.log(`👆 User interacted with: ${type}, Action: ${pressAction?.id}`);

    // ✅ REDIRECT TO CHAT
    if (type === 'chat_message' && data.sessionId) {
      navigationRef.current?.navigate('AstroChatRoom', {
        sessionId: data.sessionId,
        orderId: data.orderId,
        userName: data.senderName,
      });
    }

    // ✅ ANSWER CALL BUTTON
    if (type?.includes('call_request')) {
      if (pressAction?.id === 'answer_call' || pressAction?.id === 'default') {
        // Just setting state will open the Modal because the app is now in foreground
        setIncomingCallRequest({ 
          ...data, 
          callType: type.includes('video') ? 'video' : 'audio' 
        });
      } else if (pressAction?.id === 'reject_call') {
        handleRejectCall(data.sessionId);
      }
    }
  };

  // --- ACTIONS (Accept/Reject) ---

  const handleAcceptCall = async () => {
    if (!incomingCallRequest) return;
    const { sessionId } = incomingCallRequest;

    try {
      await CallService.acceptCall(sessionId);
      
      // ✅ AUTO CLEAR NOTIFICATION
      await notificationManager.cancelNotification('call_request_audio', sessionId);
      await notificationManager.cancelNotification('call_request_video', sessionId);

      setIncomingCallRequest(null);
      navigationRef.current?.navigate('CallScreen', incomingCallRequest);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept call');
    }
  };

  const handleRejectCall = async (specificSessionId) => {
    const sessionId = specificSessionId || incomingCallRequest?.sessionId;
    if (!sessionId) return;

    try {
      await CallService.rejectCall(sessionId, 'astrologer_rejected');
      // ✅ AUTO CLEAR
      await notificationManager.cancelNotification('call_request_audio', sessionId);
      await notificationManager.cancelNotification('call_request_video', sessionId);
    } catch (e) {
      console.error(e);
    }
    setIncomingCallRequest(null);
  };

  const handleAcceptChat = async () => {
    if (!incomingChatRequest) return;
    const { sessionId } = incomingChatRequest;

    try {
      // Validate login
      let astrologerJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
      if (!astrologerJson) astrologerJson = await AsyncStorage.getItem('astrologer');
      if (!astrologerJson) { Alert.alert('Error', 'Please log in again'); return; }

      await ChatService.acceptChatAsAstrologer(sessionId);
      await AstrologerChatSocket.connect();
      
      // ✅ AUTO CLEAR
      await notificationManager.cancelNotification('chat_request', sessionId);

      setIncomingChatRequest(null);
      navigationRef.current?.navigate('AstroChatRoom', incomingChatRequest);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept chat');
    }
  };

  const handleRejectChat = async () => {
    if (incomingChatRequest?.sessionId) {
      await notificationManager.cancelNotification('chat_request', incomingChatRequest.sessionId);
    }
    setIncomingChatRequest(null);
  };

  const handleForceLogout = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, 'fcm_token', 'deviceId']);
    await notificationManager.cancelAll();
    Alert.alert('Logged Out', 'Signed in from another device.', [
      { text: 'OK', onPress: () => navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] }) }
    ]);
  };

  return {
    incomingChatRequest,
    incomingCallRequest,
    giftNotification,
    setGiftNotification,
    handleAcceptCall,
    handleRejectCall,
    handleAcceptChat,
    handleRejectChat,
  };
};