import { useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { notificationManager } from '../services/notification/NotificationManager';
import notificationSocket from '../services/NotificationSocket';
import AstrologerChatSocket from '../services/socket/AstrologerChatSocket';
import { CallService } from '../services/api/call/CallService';
import ChatService from '../services/api/chat/ChatService';
import astrologerAuthService from '../services/api/auth.service';
import { STORAGE_KEYS } from '../config/constants';
import { storageService } from '../services/storage/storage.service';

export const useAppLogic = (navigationRef) => {
  const [incomingChatRequest, setIncomingChatRequest] = useState(null);
  const [incomingCallRequest, setIncomingCallRequest] = useState(null);
  const [giftNotification, setGiftNotification] = useState(null);
  
  // --- DATA HANDLER ---
  const handleIncomingData = (data) => {
    if (!data) return;
    const type = data.type;
    console.log('⚡ Handling Data:', type);

    // Add default name if missing
    const safeData = {
        ...data,
        userName: data.userName || 'User',
    };

    if (type === 'chat_request') {
      if (!incomingChatRequest) {
         notificationManager.displayRequestNotification(safeData);
      }
      setIncomingChatRequest({ 
          ...safeData, 
          ratePerMinute: safeData.ratePerMinute || 10 
      });
    } 
    else if (type?.includes('call_request')) {
      if (!incomingCallRequest) {
         notificationManager.displayRequestNotification(safeData);
      }
      setIncomingCallRequest({ 
        ...safeData, 
        callType: type.includes('video') ? 'video' : 'audio',
        ratePerMinute: safeData.ratePerMinute || 15 
      });
    } 
    else if (type === 'gift_received') {
      setGiftNotification(safeData);
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      console.log('🔥 [AppLogic] Initializing...');
      notificationManager.setNavigation(navigationRef.current);
      await notificationManager.setup();

      // 1. CHECK IF APP OPENED BY TAPPING NOTIFICATION (Killed State)
      const initialNotif = await notifee.getInitialNotification();
      if (initialNotif) {
        console.log('🚀 App Launched from Notifee:', initialNotif.notification.data);
        handleIncomingData(initialNotif.notification.data);
      }

      // 2. CHECK SOCKETS
      const token = await storageService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (token && deviceId) {
        await notificationSocket.connect(token, deviceId, 'astrologer');
        notificationSocket.on('new-notification', (payload) => {
           const data = payload.data || payload; 
           handleIncomingData(data);
        });
      }
      
      astrologerAuthService.setupFCMTokenRefreshListener();
    };

    init();

    return () => {
      notificationSocket.disconnect();
    };
  }, []);

  // --- FOREGROUND & BACKGROUND INTERACTIONS ---
  useEffect(() => {
    // 1. Foreground Messages (App Open)
    const unsubFCM = messaging().onMessage(async (remoteMessage) => {
      console.log('📩 Foreground FCM:', remoteMessage);
      handleIncomingData(remoteMessage.data);
    });

    // 2. User Taps Notification (Foreground or Background)
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      const { notification, pressAction } = detail;
      const data = notification?.data || {};

      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        console.log('👆 User Pressed Notification:', pressAction?.id);

        if (data.type?.includes('call_request') || data.type === 'chat_request') {
          if (pressAction?.id === 'reject_request') {
            if (data.type === 'chat_request') handleRejectChat();
            else handleRejectCall(data.sessionId);
          } else {
            // 'default' or 'accept_request' -> JUST OPEN MODAL
            handleIncomingData(data);
          }
        }
        else if (data.type === 'chat_message' && data.sessionId) {
           navigationRef.current?.navigate('AstroChatRoom', {
             sessionId: data.sessionId,
             userName: data.senderName,
           });
        }
      }
    });

    return () => {
      unsubFCM();
      unsubNotifee();
    };
  }, []);

  // --- ACTIONS ---
  const handleAcceptCall = async () => {
    if (!incomingCallRequest) return;
    const { sessionId } = incomingCallRequest;
    try {
      await CallService.acceptCall(sessionId);
      await notificationManager.cancelNotification(`req_${sessionId}`);
      setIncomingCallRequest(null);
      navigationRef.current?.navigate('CallScreen', incomingCallRequest);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept call');
    }
  };

  const handleRejectCall = async (id) => {
    // If 'id' is an Event object (from onPress), use stored sessionId
    const sessionId = (typeof id === 'string' && id) ? id : incomingCallRequest?.sessionId;
    
    // Always clear UI request immediately
    setIncomingCallRequest(null);

    if (!sessionId) {
        console.warn('⚠️ No Session ID found for rejection');
        return;
    }

    // Clear Notification immediately
    await notificationManager.cancelNotification(`req_${sessionId}`);

    try {
      console.log('🚫 Rejecting Call:', sessionId);
      await CallService.rejectCall(sessionId, 'astrologer_rejected');
    } catch (e) {
      // ✅ FIX: Gracefully handle 400/404 (Call already cancelled/timeout)
      if (e.response?.status === 400 || e.response?.status === 404) {
          console.log('ℹ️ Call was likely already cancelled by server/user.');
      } else {
          console.error('Reject Call Error:', e);
      }
    }
  };

  const handleAcceptChat = async () => {
     if (!incomingChatRequest) return;
     const { sessionId } = incomingChatRequest;
     try {
       await ChatService.acceptChatAsAstrologer(sessionId);
       await AstrologerChatSocket.connect();
       await notificationManager.cancelNotification(`req_${sessionId}`);
       setIncomingChatRequest(null);
       navigationRef.current?.navigate('AstroChatRoom', incomingChatRequest);
     } catch (error) {
       Alert.alert('Error', 'Failed to accept chat');
     }
  };

  const handleRejectChat = async (id) => {
    const sessionId = (typeof id === 'string' && id) ? id : incomingChatRequest?.sessionId;
    setIncomingChatRequest(null);

    if(sessionId) {
        await notificationManager.cancelNotification(`req_${sessionId}`);
        try {
            console.log('🚫 Rejecting Chat:', sessionId);
            await AstrologerChatSocket.connect();
            AstrologerChatSocket.rejectChat(sessionId);
        } catch (e) { console.error('Reject Chat Error:', e); }
    }
  };

  const handleForceLogout = async () => {
     await notificationManager.cancelAll();
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
    handleForceLogout
  };
};