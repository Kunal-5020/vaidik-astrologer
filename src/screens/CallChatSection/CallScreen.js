// src/screens/Call/CallScreen.js - ASTROLOGER APP (FIXED)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RtcSurfaceView } from 'react-native-agora';
import CallService from '../../services/api/call/CallService';
import AstrologerCallSocket from '../../services/socket/AstrologerCallSocket';
import AgoraEngine from '../../services/agora/engine';
import { STORAGE_KEYS } from '../../config/constants';

const COLORS = {
  PRIMARY: '#7359D1', // Astro Theme
  DANGER: '#e53935',
  BG_DARK: '#121212',
  OVERLAY: 'rgba(0,0,0,0.6)',
  MUTED: '#AAA',
};

const requestPermissions = async (needsVideo) => {
  if (Platform.OS !== 'android') return true;
  try {
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ...(needsVideo ? [PermissionsAndroid.PERMISSIONS.CAMERA] : []),
    ]);
    return (
      grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

const CallScreen = ({ route, navigation }) => {
  const { sessionId, orderId, userId, userName, callType = 'audio' } =
    route.params || {};

  const [seconds, setSeconds] = useState(0);
  const [isMicOn, setMicOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(callType === 'video');
  const [isFrontCamera, setFrontCamera] = useState(true);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false); // ✅ CRITICAL FIX

  const otherUserName = userName || 'User';
  const totalPrice = (seconds * 0.33).toFixed(2);

  const getInitials = (name) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : 'U';

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const socket = await AstrologerCallSocket.connect();
        if (!mounted || !socket?.connected) return;

        setIsConnected(true);

        // Get Astrologer ID
        let astroJson = await AsyncStorage.getItem(STORAGE_KEYS.ASTROLOGER_DATA);
        if (!astroJson) astroJson = await AsyncStorage.getItem('astrologer');
        const astrologer = astroJson ? JSON.parse(astroJson) : null;
        const astrologerId = astrologer?._id || astrologer?.id;

        if (astrologerId && sessionId) {
          AstrologerCallSocket.joinSession(sessionId, astrologerId);
        }

        // Listeners
        AstrologerCallSocket.on('timer_start', async (payload) => {
          if (payload.sessionId !== sessionId) return;

          const hasPerm = await requestPermissions(callType === 'video');
          if (!hasPerm) {
            Alert.alert('Permission Denied', 'Camera/Mic permission required');
            return;
          }

          setSeconds(0);
          
          // 1. Init Engine
          await AgoraEngine.init(payload.agoraAppId);

          AgoraEngine.registerEventHandler({
            onUserJoined: (conn, uid) => {
              console.log('👤 Remote user joined:', uid);
              setRemoteUid(uid);
            },
            onUserOffline: () => {
              console.log('👋 Remote user left');
              setRemoteUid(null);
            },
            onJoinChannelSuccess: () => {
                console.log('✅ Joined Channel Success');
            }
          });

          // 2. Join Channel (this now includes enableVideo + setupLocalVideo + startPreview)
          await AgoraEngine.join(
            payload.agoraToken,
            payload.agoraChannelName,
            Number(payload.agoraAstrologerUid),
            callType === 'video',
          );

          // 3. ✅ NOW set ready. This ensures Views mount AFTER engine has bound video.
          setIsEngineReady(true); 
        });

        AstrologerCallSocket.on('timer_tick', (payload) => {
          if (payload.sessionId === sessionId)
            setSeconds(payload.elapsedSeconds || 0);
        });

        AstrologerCallSocket.on('call_ended', async (data) => {
          if (data.sessionId === sessionId) {
            await cleanup();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }
        });
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    };

    setup();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [sessionId, callType]);

  const cleanup = async () => {
    AstrologerCallSocket.off('timer_start');
    AstrologerCallSocket.off('timer_tick');
    AstrologerCallSocket.off('call_ended');
    try {
      await AgoraEngine.leave();
      await AgoraEngine.destroy();
    } catch (e) {}
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(
      2,
      '0',
    )}`;

  const handleEndCall = () => {
    Alert.alert('End Call', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          await CallService.endCall(sessionId, 'astrologer_ended');
          await cleanup();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        },
      },
    ]);
  };

  const handleToggleMic = () => {
    const next = !isMicOn;
    setMicOn(next);
    AgoraEngine.setMic(next);
  };

  const handleToggleVideo = () => {
    const next = !isVideoOn;
    setVideoOn(next);
    AgoraEngine.setVideo(next);
  };

  const handleSwitchCamera = () => {
    AgoraEngine.switchCamera();
    setFrontCamera(!isFrontCamera);
  };

  // RENDER HELPERS
  const renderVideoLayout = () => (
    <View style={styles.videoContainer}>
      {/* 1. REMOTE VIDEO (Full Screen) */}
      {isEngineReady && remoteUid ? (
        <RtcSurfaceView
          style={styles.remoteVideo}
          canvas={{ uid: remoteUid, renderMode: 1 }} // Fit mode
        />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="account" size={80} color="#FFF" />
          <Text style={styles.waitingText}>Waiting for user...</Text>
        </View>
      )}

      {/* 2. SELF VIDEO (PiP - Top Right) */}
      {isEngineReady && isVideoOn && (
        <View style={styles.localVideoWrapper}>
          <RtcSurfaceView
            style={styles.localVideo}
            zOrderMediaOverlay={true} // ✅ Shows on top of remote
            canvas={{
              uid: 0,
              renderMode: 1,
              mirrorMode: isFrontCamera ? 1 : 0,
            }}
          />
        </View>
      )}
    </View>
  );

  const renderAudioLayout = () => (
    <View style={styles.audioContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(otherUserName)}</Text>
      </View>
      <Text style={styles.name}>{otherUserName}</Text>
      <Text style={styles.statusText}>
        {isConnected ? 'Call Active' : 'Connecting...'}
      </Text>
      <Text style={styles.timerBig}>{formatTime(seconds)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      {callType === 'video' ? renderVideoLayout() : renderAudioLayout()}

      {/* Header Overlay (Video Only) */}
      {callType === 'video' && (
        <View style={styles.headerOverlay}>
          <View style={styles.timerChip}>
            <View style={styles.greenDot} />
            <Text style={styles.chipText}>{formatTime(seconds)}</Text>
          </View>
          <View style={styles.earningsChip}>
            <Text style={styles.chipText}>Earned: ₹{totalPrice}</Text>
          </View>
        </View>
      )}

      {/* Footer Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleToggleMic}
          style={[styles.btn, !isMicOn && styles.btnOff]}
        >
          <Icon
            name={isMicOn ? 'microphone' : 'microphone-off'}
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>

        {callType === 'video' && (
          <>
            <TouchableOpacity
              onPress={handleToggleVideo}
              style={[styles.btn, !isVideoOn && styles.btnOff]}
            >
              <Icon
                name={isVideoOn ? 'video' : 'video-off'}
                size={28}
                color="#FFF"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSwitchCamera} style={styles.btn}>
              <Icon name="camera-flip" size={28} color="#FFF" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleEndCall}
          style={[styles.btn, styles.btnEnd]}
        >
          <Icon name="phone-hangup" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },

  // VIDEO LAYOUT
  videoContainer: { flex: 1 },
  remoteVideo: { flex: 1 },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  waitingText: { color: '#FFF', fontSize: 18, marginTop: 12 },

  // SELF VIDEO (PiP)
  localVideoWrapper: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#333',
    elevation: 5,
    zIndex: 100, // ✅ High zIndex
  },
  localVideo: { flex: 1 },

  // AUDIO LAYOUT
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 10,
  },
  avatarText: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  name: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  statusText: { fontSize: 16, color: COLORS.MUTED, marginTop: 4, marginBottom: 16 },
  timerBig: { fontSize: 36, fontWeight: '300', color: '#FFF' },

  // OVERLAYS
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  earningsChip: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  chipText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  // CONTROLS
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    zIndex: 20,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOff: { backgroundColor: '#FFF', opacity: 0.8 },
  btnEnd: { backgroundColor: COLORS.DANGER },
});

export default CallScreen;
