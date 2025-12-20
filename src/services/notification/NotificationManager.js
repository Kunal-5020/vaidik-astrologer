// src/services/notification/NotificationManager.js
import notifee, { 
  AndroidImportance, 
  AndroidCategory, 
  AndroidVisibility, 
  EventType 
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

const CHANNELS = {
  // ⚠️ CHANGED ID: This forces Android to register a NEW channel with the custom sound.
  CALL: 'astro_call_channel_v2', 
  CHAT: 'astro_chat_channel_v2',
  DEFAULT: 'astro_default_channel_v2',
};

class NotificationManager {
  constructor() {
    this.navigationRef = null;
  }

  setNavigation(ref) {
    this.navigationRef = ref;
  }

  // --- 1. SETUP & PERMISSIONS ---
  async setup() {
    await this.requestPermissions();
    await this.createChannels();
  }

  async requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const authStatus = await messaging().requestPermission();
  }

  async createChannels() {
    // 1. CALL CHANNEL (High Importance, Custom Sound)
    await notifee.createChannel({
      id: CHANNELS.CALL,
      name: 'Incoming Calls',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'call_ringtone', // ✅ Ensure 'call_ringtone.mp3' is in android/app/src/main/res/raw/
      vibration: true,
      vibrationPattern: [300, 500],
      bypassDnd: true,
    });

    // 2. CHAT CHANNEL
    await notifee.createChannel({
      id: CHANNELS.CHAT,
      name: 'Chat Messages',
      importance: AndroidImportance.HIGH,
      sound: 'chat_tone', // ✅ Ensure 'chat_tone.mp3' is in android/app/src/main/res/raw/
      vibration: true,
    });

    // 3. DEFAULT
    await notifee.createChannel({
      id: CHANNELS.DEFAULT,
      name: 'General Notifications',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  // --- 2. DISPLAY LOGIC ---
  async displayNotification(remoteMessage) {
    const { data } = remoteMessage;
    const type = data?.type;
    const title = remoteMessage.notification?.title || 'Notification';
    const body = remoteMessage.notification?.body || '';

    // Unique ID for Auto-Clearing later
    const notificationId = data?.sessionId ? `${type}_${data.sessionId}` : `notif_${Date.now()}`;

    let notificationConfig = {
      id: notificationId,
      title,
      body,
      data: data || {},
      android: {
        channelId: CHANNELS.DEFAULT,
        // ✅ FIXED: Use 'ic_launcher' (your app icon) to prevent crash
        smallIcon: 'ic_launcher', 
        pressAction: { id: 'default' },
      },
    };

    // --- CONFIGURATION BASED ON TYPE ---
    switch (type) {
      case 'call_request_audio':
      case 'call_request_video':
        notificationConfig.android = {
          ...notificationConfig.android,
          channelId: CHANNELS.CALL,
          category: AndroidCategory.CALL,
          importance: AndroidImportance.HIGH,
          fullScreenAction: {
            id: 'answer_call',
            launchActivity: 'default',
          },
          pressAction: { id: 'default', launchActivity: 'default' },
          ongoing: true,
          loopSound: true, // This loops the 'call_ringtone'
          actions: [
            { title: 'Answer', pressAction: { id: 'answer_call', launchActivity: 'default' } },
            { title: 'Reject', pressAction: { id: 'reject_call' } },
          ],
        };
        break;

      case 'chat_message':
        notificationConfig.android = {
          ...notificationConfig.android,
          channelId: CHANNELS.CHAT,
          category: AndroidCategory.MESSAGE,
          pressAction: { id: 'view_chat', launchActivity: 'default' },
        };
        break;

      case 'gift_received':
        notificationConfig.android.channelId = CHANNELS.DEFAULT;
        break;
    }

    await notifee.displayNotification(notificationConfig);
  }

  // --- 3. AUTO CLEAR LOGIC ---
  async cancelNotification(type, sessionId) {
    if (!sessionId) return;
    const id = `${type}_${sessionId}`;
    await notifee.cancelNotification(id);
    console.log(`🧹 Notification cleared: ${id}`);
  }

  async cancelAll() {
    await notifee.cancelAllNotifications();
  }
}

export const notificationManager = new NotificationManager();