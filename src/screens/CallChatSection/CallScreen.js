import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  StatusBar, 
  Platform, 
  PermissionsAndroid, 
  BackHandler // Import BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RtcSurfaceView } from 'react-native-agora';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

import CallService from '../../services/api/call/CallService';
import AstrologerCallSocket from '../../services/socket/AstrologerCallSocket';
import AgoraEngine from '../../services/agora/engine';
import { STORAGE_KEYS } from '../../config/constants';

const COLORS = {
  PRIMARY: '#7359D1',
  BG: '#0F0F13',
  DANGER: '#FF453A',
  SUCCESS: '#32D74B',
  SURFACE: 'rgba(255, 255, 255, 0.08)',
};

const CallScreen = ({ route, navigation }) => {
  const { sessionId, userName = 'User', callType = 'audio', ratePerMinute = 10 } = route.params || {};

  // ✅ STATE
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isMicOn, setMicOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(callType === 'video');
  const [remoteUid, setRemoteUid] = useState(null);
  const [isEngineReady, setIsEngineReady] = useState(false);

  // ✅ REFS (For stable timer access)
  const remainingTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerIntervalRef = useRef(null);

  // Calculate live earnings
  const currentEarnings = ((elapsed / 60) * ratePerMinute).toFixed(2);

  // --- 1. BACK HANDLER (Fixed Crash) ---
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('End Call', 'Are you sure you want to end this session?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Call', style: 'destructive', onPress: handleEnd }
        ]);
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        // ✅ FIX: Use .remove() on the subscription object
        subscription.remove();
      };
    }, [])
  );

  // --- 2. LOCAL TIMER LOGIC ---
  const startLocalTimer = (durationSeconds, initialElapsed = 0) => {
    // Clear existing
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Init refs & state
    remainingTimeRef.current = durationSeconds;
    elapsedRef.current = initialElapsed;
    
    setRemainingTime(durationSeconds);
    setElapsed(initialElapsed);

    // Start Interval
    timerIntervalRef.current = setInterval(() => {
      // 1. Update Remaining
      if (remainingTimeRef.current > 0) {
        remainingTimeRef.current -= 1;
        setRemainingTime(remainingTimeRef.current);
      } else if (remainingTimeRef.current <= 0) {
         // Optional: Auto-end logic could go here
      }

      // 2. Update Elapsed
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  };

  // --- 3. MAIN SETUP ---
  useEffect(() => {
    let mounted = true;
    
    const setup = async () => {
      try {
        const socket = await AstrologerCallSocket.connect();
        if (!mounted || !socket?.connected) return;

        // Get Astrologer Data
        let astroJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
        const astrologer = astroJson ? JSON.parse(astroJson) : null;
        
        // Join Session
        if (astrologer?._id) {
            AstrologerCallSocket.joinSession(sessionId, astrologer._id);
        }

        // ✅ A. TIMER START Listener
        AstrologerCallSocket.on('timer_start', async (payload) => {
            console.log('⏰ [ASTRO] timer_start:', payload);
            
            if (payload.sessionId !== sessionId) return;

            // Start Local Timer
            startLocalTimer(payload.maxDurationSeconds, 0);

            // Join Agora
            const astroUid = Number(payload.agoraAstrologerUid) || Number(payload.agoraUid);
            await initAgora({ ...payload, agoraAstrologerUid: astroUid });
            
            // Re-join socket room to be safe
            if (astrologer?._id) {
               AstrologerCallSocket.joinSession(sessionId, astrologer._id, 'astrologer');
            }
        });

        // ✅ B. SYNC / TICK Listener (Drift Correction)
        AstrologerCallSocket.on('timer_tick', (payload) => {
          if (payload.sessionId === sessionId) {
            // Correct drift if > 2 seconds
            const diff = Math.abs(remainingTimeRef.current - payload.remainingSeconds);
            if (diff > 2) {
               console.log('⚠️ [ASTRO] Syncing timer drift');
               remainingTimeRef.current = payload.remainingSeconds;
               elapsedRef.current = payload.elapsedSeconds;
               
               setRemainingTime(payload.remainingSeconds);
               setElapsed(payload.elapsedSeconds);
            }
          }
        });

        // ✅ C. END CALL Listener
        AstrologerCallSocket.on('call_ended', () => {
          console.log('🛑 [ASTRO] call_ended received');
          cleanup();
          Alert.alert('Call Ended', 'The session has ended.', [
             { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }
          ]);
        });

        // ✅ D. MANUAL SYNC (Recover state)
        AstrologerCallSocket.emit('sync_timer', { sessionId }, (res) => {
          if (res?.success) {
            console.log('🔄 [ASTRO] Manual sync success:', res.data);
            startLocalTimer(res.data.remainingSeconds, res.data.elapsedSeconds);
            
            // If already active, ensure Agora is joined (logic omitted for brevity, usually handled by timer_start)
          }
        });

      } catch (e) { 
        console.error('❌ [ASTRO] Setup failed:', e); 
      }
    };

    setup();
    
    return () => { 
        mounted = false; 
        cleanup(); 
    };
  }, [sessionId]);

  const initAgora = async (payload) => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA
        ]);
      }
      
      await AgoraEngine.init(payload.agoraAppId);
      setIsEngineReady(true);
      
      AgoraEngine.registerEventHandler({
        onUserJoined: (channel, uid) => {
          console.log('👤 [ASTRO] USER JOINED:', uid);
          setRemoteUid(uid);
        },
        onUserOffline: () => {
          console.log('👋 [ASTRO] USER LEFT');
          setRemoteUid(null);
        },
      });

      const uid = Number(payload.agoraAstrologerUid);
      if (isNaN(uid)) {
         console.error('❌ Invalid UID:', uid);
         return;
      }

      await AgoraEngine.join(
        payload.agoraToken,
        payload.agoraChannelName, 
        uid, 
        true // Astrologer is broadcaster? Assuming yes for 1-on-1
      );
    } catch (e) {
        console.error('❌ [ASTRO] Agora init failed:', e);
    }
  };

  const cleanup = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    AstrologerCallSocket.off('timer_start');
    AstrologerCallSocket.off('timer_tick');
    AstrologerCallSocket.off('call_ended');
    try { 
        await AgoraEngine.leave(); 
        await AgoraEngine.destroy(); 
    } catch (e) {}
  };

  const formatTime = (s) => {
    if (!s || s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = async () => {
      try {
        await CallService.endCall(sessionId, 'astrologer_ended');
        cleanup();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } catch (error) {
          console.error('Failed to end call:', error);
          Alert.alert('Error', 'Failed to end call. Please try again.');
      }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BG} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.flex1}>
        {callType === 'video' ? (
          <View style={styles.flex1}>
             {isEngineReady && remoteUid ? (
               <RtcSurfaceView style={styles.flex1} canvas={{ uid: remoteUid, renderMode: 1 }} />
             ) : (
               <View style={styles.center}>
                 <Text style={styles.text}>Waiting for user video...</Text>
               </View>
             )}
             
             {/* TIMER OVERLAY FOR VIDEO */}
             <View style={styles.videoTimerOverlay}>
               <Text style={styles.videoTimerText}>{formatTime(remainingTime)}</Text>
             </View>

             {isEngineReady && isVideoOn && (
               <View style={styles.localVideo}>
                 <RtcSurfaceView style={styles.flex1} zOrderMediaOverlay={true} canvas={{ uid: 0, renderMode: 1 }} />
               </View>
             )}
          </View>
        ) : (
          <LinearGradient colors={[COLORS.BG, '#1e1e24']} style={styles.center}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
              </View>
            </View>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.status}>Call in Progress</Text>
            
            <Text style={styles.bigTimer}>{formatTime(remainingTime)}</Text>
            <Text style={styles.subText}>Remaining Duration</Text>
          </LinearGradient>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, !isMicOn && styles.btnOff]} onPress={() => { setMicOn(!isMicOn); AgoraEngine.setMic(!isMicOn); }}>
          <Icon name={isMicOn ? 'microphone' : 'microphone-off'} size={28} color={isMicOn ? "#FFF" : "#000"} />
        </TouchableOpacity>
        
        {callType === 'video' && (
          <TouchableOpacity style={styles.btn} onPress={() => AgoraEngine.switchCamera()}>
            <Icon name="camera-flip" size={28} color="#FFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
          <Icon name="phone-hangup" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 20, alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 69, 58, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 69, 58, 0.5)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.DANGER, marginRight: 6 },
  liveText: { color: COLORS.DANGER, fontWeight: 'bold', fontSize: 12 },
  
  earnPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  earnLabel: { color: '#AAA', marginRight: 6, fontSize: 12 },
  earnValue: { color: COLORS.SUCCESS, fontWeight: 'bold', fontSize: 16 },

  // Audio UI
  avatarRing: { padding: 4, borderRadius: 60, borderWidth: 2, borderColor: COLORS.PRIMARY, marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.SURFACE, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, color: COLORS.PRIMARY, fontWeight: 'bold' },
  name: { fontSize: 28, color: '#FFF', fontWeight: 'bold', marginBottom: 4 },
  status: { color: '#666', fontSize: 16 },
  bigTimer: { fontSize: 72, fontWeight: '200', color: '#FFF', marginTop: 40, fontVariant: ['tabular-nums'] },
  subText: { color: '#444', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },

  // Video UI
  localVideo: { position: 'absolute', top: 80, right: 20, width: 100, height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: '#000' },
  videoTimerOverlay: { position: 'absolute', top: 80, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  videoTimerText: { color: '#FFF', fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  text: { color: '#888' },

  footer: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  btn: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.SURFACE, justifyContent: 'center', alignItems: 'center' },
  btnOff: { backgroundColor: '#FFF' },
  endBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.DANGER, justifyContent: 'center', alignItems: 'center', elevation: 10 },
});

export default CallScreen;
