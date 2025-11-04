import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from 'react-native-agora';
import { livestreamService, streamSocketService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { AppState } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LiveStreamScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { state } = useAuth();
  
  const { 
    streamId, 
    channelName, 
    token, 
    uid, 
    appId, 
    title, 
    callSettings = { 
      isCallEnabled: true,
      voiceCallPrice: 50,
      videoCallPrice: 100,
      allowPublicCalls: true,
      allowPrivateCalls: true,
      maxCallDuration: 600,
    } 
  } = route.params;

  // Refs
  const engineRef = useRef(null);
  const isInitialized = useRef(false);
  const controlsTimeout = useRef(null);
  const giftAnimValue = useRef(new Animated.Value(0)).current;

  // Agora State
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState(new Map());

  // Stream State
  const [isLive, setIsLive] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [currentState, setCurrentState] = useState('streaming');
  const [startTime, setStartTime] = useState(null);

  // Chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Call Management
  const [callWaitlist, setCallWaitlist] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showCallSettingsModal, setShowCallSettingsModal] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isCallTimerActive, setIsCallTimerActive] = useState(false);

  // Gift Animation
  const [activeGifts, setActiveGifts] = useState([]);

  // UI State
  const [showControls, setShowControls] = useState(true);

  // ✅ Extract user info properly
  const userName = state.astrologer?.name || state.user?.name || 'Astrologer';
  const userId = state.astrologer?._id || state.astrologer?.id || state.user?._id || state.user?.id;

  // console.log('🔍 User Info:', { userId, userName, state });

  if (!userId) {
    Alert.alert('Error', 'User not authenticated');
    navigation.goBack();
    return null;
  }

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initialize = async () => {
      await initializeAgora();
      await connectSocket();
      await startStream();
      setStartTime(Date.now());
    };

    initialize();

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      if (isLive && streamSocketService.socket?.connected) {
        streamSocketService.socket.emit('stream_heartbeat', { streamId });
      }
    }, 10000);

    return () => {
      isInitialized.current = false;
      clearInterval(heartbeatInterval);
      cleanup();
    };
  }, []);

  // App state listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' && isLive) {
        endStream();
      }
    });
    return () => subscription.remove();
  }, [isLive]);

  // Call timer
  useEffect(() => {
    let interval;
    if (isCallTimerActive && currentCall) {
      interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallTimerActive, currentCall]);

  // ==================== AGORA ====================

const initializeAgora = async () => {
  try {
    console.log('🎥 Initializing Agora...');
    
    const engine = createAgoraRtcEngine();
    engineRef.current = engine;

    // ✅ STEP 1: Initialize with proper config
    engine.initialize({
      appId: appId,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });

    // ✅ STEP 2: Register event handlers FIRST
    engine.registerEventHandler({
      onJoinChannelSuccess: (connection, elapsed) => {
        console.log('✅ Host joined channel successfully');
        console.log('Connection:', connection);
        setIsJoined(true);
        setIsLive(true);
      },
      
      onUserJoined: (connection, remoteUid) => {
  console.log('====================================');
  console.log('👤 REMOTE USER JOINED AGORA (HOST PERSPECTIVE)');
  console.log('Remote UID:', remoteUid);
  console.log('====================================');
  
  // ✅ Add to remote users map immediately
  setRemoteUsers(prev => {
    const newMap = new Map(prev);
    newMap.set(remoteUid, { uid: remoteUid });
    console.log('📝 Remote users map:', Array.from(newMap.keys()));
    return newMap;
  });
  
  // ✅ CRITICAL FIX: Check if we're expecting a caller
  // Use a longer delay to ensure state is updated
  setTimeout(() => {
    setCurrentCall(prevCall => {
      console.log('====================================');
      console.log('🔄 DELAYED CHECK FOR CALLER UID');
      console.log('Previous Call State:', prevCall);
      console.log('Remote UID that joined:', remoteUid);
      console.log('====================================');
      
      // ✅ If we have an active call but no caller UID yet, this must be the caller
      if (prevCall && prevCall.isOnCall) {
        if (!prevCall.callerAgoraUid || prevCall.callerAgoraUid === 0) {
          console.log('✅ SETTING CALLER UID:', remoteUid);
          return {
            ...prevCall,
            callerAgoraUid: remoteUid  // Use the ACTUAL UID from Agora
          };
        } else if (prevCall.callerAgoraUid !== remoteUid) {
          // ✅ Backend UID was wrong, override it
          console.log('⚠️ CORRECTING CALLER UID');
          console.log('Backend said:', prevCall.callerAgoraUid);
          console.log('Actual UID:', remoteUid);
          return {
            ...prevCall,
            callerAgoraUid: remoteUid  // Override with actual UID
          };
        }
      }
      
      return prevCall;
    });
  }, 500); // ✅ Increased delay to 500ms for proper state sync
},

      
      onUserOffline: (connection, remoteUid, reason) => {
        console.log('====================================');
        console.log('👋 REMOTE USER LEFT');
        console.log('Remote UID:', remoteUid);
        console.log('Reason:', reason);
        console.log('====================================');
        
        setRemoteUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(remoteUid);
          return newMap;
        });
        
        // ✅ FIX ISSUE 2 & 3: Auto-end call if caller leaves
        setCurrentCall(prevCall => {
          if (prevCall && prevCall.callerAgoraUid === remoteUid) {
            console.log('📞 Caller left - auto-ending call');
            Alert.alert('Call Ended', 'The caller has disconnected');
            
            // Trigger cleanup
            setTimeout(() => endCurrentCall(), 100);
            return null;
          }
          return prevCall;
        });
      },
      
      onRemoteVideoStateChanged: (connection, remoteUid, state, reason, elapsed) => {
        console.log('====================================');
        console.log('📹 REMOTE VIDEO STATE CHANGED');
        console.log('UID:', remoteUid);
        console.log('State:', state, '(0=stopped, 1=frozen, 2=decoding)');
        console.log('Reason:', reason);
        console.log('====================================');
      },
      
      onError: (err, msg) => {
        console.error('❌ Agora error:', err, msg);
      },
      
      onLeaveChannel: (connection, stats) => {
        console.log('📤 Left channel:', stats);
        setIsJoined(false);
      },
    });

    // ✅ STEP 3: Enable video and audio BEFORE joining
    await engine.enableVideo();
    await engine.enableAudio();
    
    // ✅ STEP 4: Set broadcaster role BEFORE joining
    await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    
    // ✅ STEP 5: Enable local video (critical for host)
    await engine.enableLocalVideo(true);
    await engine.enableLocalAudio(true);
    
    // ✅ STEP 6: Start preview AFTER enabling video
    await engine.startPreview();
    
    console.log('✅ Video/Audio enabled, preview started');

    // ✅ STEP 7: Join channel with proper options
    await engine.joinChannel(token, channelName, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      publishMicrophoneTrack: true,
      publishCameraTrack: true,
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
    });

    console.log('✅ Agora initialization complete');
    
  } catch (error) {
    console.error('❌ Agora init error:', error);
    Alert.alert('Error', 'Failed to initialize video: ' + error.message);
  }
};



  // ==================== SOCKET ====================

  const connectSocket = async () => {
    try {
      console.log('🔌 Connecting socket:', { streamId, userId, userName });

      await streamSocketService.connect(streamId, userId, userName, true);

      console.log('✅ Host socket connected');

      // Register listeners
      streamSocketService.onNewComment(handleNewComment);
      streamSocketService.onNewLike(handleNewLike);
      streamSocketService.onNewGift(handleNewGift);
      streamSocketService.onViewerJoined(handleViewerJoined);
      streamSocketService.onViewerLeft(handleViewerLeft);
      
      // ✅ CRITICAL: Listen for viewer count updates
      streamSocketService.onViewerCountUpdated((data) => {
        console.log('👥 Viewer count updated:', data.count);
        setViewerCount(data.count);
      });

      streamSocketService.onCallRequestReceived((data) => {
        console.log('📞 Call request received:', data);
        handleCallRequest(data);
      });

      console.log('✅ All socket listeners registered');
    } catch (error) {
      console.error('❌ Socket connection error:', error);
    }
  };

  const startStream = async () => {
    try {
      const response = await livestreamService.startStream(streamId);
      if (response.success) {
        setIsLive(true);
        console.log('✅ Stream started');
      }
    } catch (error) {
      console.error('❌ Start stream error:', error);
      Alert.alert('Error', 'Failed to start stream');
    }
  };

  const cleanup = async () => {
  try {
    console.log('🧹 Starting HOST cleanup...');
    
    // ✅ End any active call first
    if (currentCall) {
      console.log('⚠️ Active call detected during cleanup - ending it');
      await endCurrentCall();
    }
    
    // ✅ Agora cleanup
    if (engineRef.current) {
      try {
        await engineRef.current.stopPreview();
        console.log('✅ Preview stopped');
      } catch (e) {
        console.warn('Preview stop error:', e);
      }
      
      try {
        await engineRef.current.leaveChannel();
        console.log('✅ Left channel');
      } catch (e) {
        console.warn('Leave channel error:', e);
      }
      
      try {
        await engineRef.current.disableVideo();
        await engineRef.current.disableAudio();
        console.log('✅ Video/Audio disabled');
      } catch (e) {
        console.warn('Disable error:', e);
      }
      
      try {
        engineRef.current.release();
        console.log('✅ Engine released');
      } catch (e) {
        console.warn('Release error:', e);
      }
      
      engineRef.current = null;
    }
    
    // ✅ Socket cleanup
    streamSocketService.disconnect();
    console.log('✅ Socket disconnected');
    
    // ✅ End stream on backend
    if (isLive) {
      try {
        await livestreamService.endStream(streamId);
        console.log('✅ Stream ended on backend');
      } catch (e) {
        console.warn('End stream error:', e);
      }
    }
    
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};


  // ==================== EVENT HANDLERS ====================

  const handleNewComment = (data) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type: 'comment',
      userName: data.userName,
      message: data.comment,
      timestamp: new Date(data.timestamp),
    }]);
  };

  const handleNewLike = (data) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type: 'like',
      userName: data.userName,
      timestamp: new Date(data.timestamp),
    }]);
  };

  const handleNewGift = (data) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type: 'gift',
      userName: data.userName,
      giftName: data.giftName,
      amount: data.amount,
      timestamp: new Date(data.timestamp),
    }]);
    showGiftAnimation(data);
  };

  const handleViewerJoined = (data) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type: 'join',
      userName: data.userName,
      timestamp: new Date(data.timestamp),
    }]);
  };

  const handleViewerLeft = (data) => {
    // Optional: show leave message
  };

  const handleCallRequest = (data) => {
    console.log('📞 Adding call request to waitlist:', data);
    
    setCallWaitlist(prev => {
      if (prev.find(r => r.userId === data.userId)) return prev;
      const newRequest = {
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        callType: data.callType,
        callMode: data.callMode,
        position: prev.length + 1,
        requestedAt: new Date(data.timestamp),
      };
      return [...prev, newRequest];
    });

    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type: 'call_request',
      userName: data.userName,
      callType: data.callType,
      timestamp: new Date(data.timestamp),
    }]);

    if (callWaitlist.length === 0) {
      Alert.alert('New Call Request', `${data.userName} wants to join`);
    }
  };

  const showGiftAnimation = (giftData) => {
    const giftId = Date.now().toString() + Math.random();
    setActiveGifts(prev => [...prev, { ...giftData, id: giftId }]);

    Animated.sequence([
      Animated.timing(giftAnimValue, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(giftAnimValue, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setActiveGifts(prev => prev.filter(g => g.id !== giftId)));
  };

  // ==================== CONTROLS ====================

  const toggleMic = async () => {
    try {
      const newState = !isMicEnabled;
      await engineRef.current?.muteLocalAudioStream(!newState);
      await livestreamService.toggleMic(streamId, newState);
      setIsMicEnabled(newState);
      streamSocketService.notifyHostMicToggled(streamId, newState);
    } catch (error) {
      console.error('Toggle mic error:', error);
    }
  };

  const toggleCamera = async () => {
    try {
      const newState = !isCameraEnabled;
      await engineRef.current?.muteLocalVideoStream(!newState);
      await livestreamService.toggleCamera(streamId, newState);
      setIsCameraEnabled(newState);
      streamSocketService.notifyHostCameraToggled(streamId, newState);
    } catch (error) {
      console.error('Toggle camera error:', error);
    }
  };

  const switchCamera = async () => {
    try {
      await engineRef.current?.switchCamera();
    } catch (error) {
      console.error('Switch camera error:', error);
    }
  };

  const handleEndStream = () => {
    Alert.alert('End Live Stream', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'End', onPress: endStream },
    ]);
  };

  const endStream = async () => {
    try {
      await livestreamService.endStream(streamId);
      setIsLive(false);
      navigation.replace('StreamAnalytics', { streamId });
    } catch (error) {
      console.error('End stream error:', error);
      if (error.response?.status === 400) {
        navigation.replace('StreamAnalytics', { streamId });
      } else {
        Alert.alert('Error', 'Failed to end stream');
      }
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    streamSocketService.sendComment(streamId, userId, userName, state.astrologer?.profilePicture, chatInput.trim());
    setChatInput('');
  };

  // ==================== CALL MANAGEMENT ====================

  const acceptCall = async (callRequest) => {
  try {
    console.log('====================================');
    console.log('✅ HOST ACCEPTING CALL');
    console.log('Call Request:', callRequest);
    console.log('====================================');

    const response = await livestreamService.acceptCallRequest(streamId, callRequest.userId);
    
    console.log('====================================');
    console.log('📡 ACCEPT CALL API RESPONSE');
    console.log('Success:', response.success);
    console.log('Caller UID from backend:', response.data?.callerAgoraUid || response.data?.uid);
    console.log('====================================');
    
    if (response.success) {
      // Remove from waitlist
      setCallWaitlist(prev => prev.filter(r => r.userId !== callRequest.userId));
      
      // ✅ Extract caller UID from response
      const backendCallerUid = response.data?.callerAgoraUid || response.data?.uid;
      
      console.log('====================================');
      console.log('📞 SETTING UP CALL STATE');
      console.log('Backend provided UID:', backendCallerUid);
      console.log('====================================');
      
      // ✅ Set current call with UID from backend (not null)
      const newCallState = {
        userId: callRequest.userId,
        userName: callRequest.userName,
        callType: callRequest.callType,
        callMode: callRequest.callMode,
        startedAt: new Date(),
        isOnCall: true,
        callerAgoraUid: backendCallerUid, // ✅ Use backend UID immediately
      };
      
      console.log('📞 New Call State:', newCallState);
      
      setCurrentCall(newCallState);
      setCallTimer(0);
      setIsCallTimerActive(true);
      setCurrentState('on_call');
      
      // ✅ Notify via socket
      streamSocketService.notifyCallAccepted(
        streamId,
        callRequest.userId,
        callRequest.userName,
        callRequest.callType,
        callRequest.callMode,
        backendCallerUid
      );

      setShowWaitlistModal(false);
      Alert.alert('Call Started', `${callRequest.userName} is joining...`);
      
      console.log('✅ Call acceptance complete');
    }
  } catch (error) {
    console.error('❌ Accept call error:', error);
    Alert.alert('Error', 'Failed to accept call: ' + (error.formattedMessage || error.message));
  }
};

  const rejectCall = async (callRequest) => {
  try {
    console.log('====================================');
    console.log('❌ REJECTING CALL REQUEST');
    console.log('User ID:', callRequest.userId);
    console.log('User Name:', callRequest.userName);
    console.log('====================================');

    // Remove from backend
    await livestreamService.rejectCallRequest(streamId, callRequest.userId);
    
    // Remove from local state
    setCallWaitlist(prev => prev.filter(r => r.userId !== callRequest.userId));
    
    // ✅ Emit socket event with correct data
    streamSocketService.socket.emit('call_rejected', {
      streamId,
      userId: callRequest.userId,
    });

    console.log('✅ Rejection notification sent');
    
    Alert.alert('Success', `Rejected ${callRequest.userName}'s request`);
  } catch (error) {
    console.error('❌ Reject call error:', error);
    Alert.alert('Error', 'Failed to reject call');
  }
};


 // Replace ONLY the endCurrentCall function with this:

const endCurrentCall = async () => {
  try {
    console.log('====================================');
    console.log('📞 HOST ENDING CALL');
    console.log('Current Call:', currentCall);
    console.log('Call Timer:', callTimer);
    console.log('====================================');

    if (!currentCall) {
      console.log('⚠️ No active call to end');
      return;
    }

    const response = await livestreamService.endCurrentCall(streamId);
    
    if (response.success) {
      const duration = Math.floor(callTimer);
      const charge = response.data?.charge || 0;
      
      console.log('====================================');
      console.log('✅ CALL ENDED - NOTIFYING VIEWERS');
      console.log('Duration:', duration, 'seconds');
      console.log('Charge:', charge);
      console.log('====================================');
      
      // ✅ FIX ISSUE 2 & 3: Emit proper socket event
      if (streamSocketService.socket?.connected) {
        streamSocketService.socket.emit('call_ended', {
          streamId,
          duration,
          charge,
          timestamp: new Date().toISOString(),
        });
        
        console.log('✅ call_ended event emitted to all viewers');
      } else {
        console.error('❌ Socket not connected - cannot notify viewers');
      }
      
      // ✅ FIX ISSUE 3: Clear ALL call-related state
      setCurrentCall(null);
      setCallTimer(0);
      setIsCallTimerActive(false);
      setCurrentState('streaming');
      
      // ✅ Clear any remaining waitlist
      setCallWaitlist([]);
      
      console.log('✅ Call state cleared');
      
      Alert.alert(
        'Call Ended', 
        `Duration: ${formatCallDuration(duration)}\nEarned: ₹${charge}`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('❌ End call error:', error);
    
    // ✅ Even if API fails, clear local state
    setCurrentCall(null);
    setCallTimer(0);
    setIsCallTimerActive(false);
    setCurrentState('streaming');
    
    Alert.alert('Error', 'Failed to end call properly: ' + (error.message || 'Unknown error'));
  }
};




  const toggleControls = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== RENDER ====================

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.videoContainer} activeOpacity={1} onPress={toggleControls}>
        {/* ✅ ENHANCED VIDEO RENDERING - FIXES BLACK SCREEN */}
{isJoined && isCameraEnabled ? (
  currentCall && currentCall.callType === 'video' ? (
    <View style={styles.splitScreenContainer}>
      {/* Host Video - Top Half */}
      <View style={styles.hostVideoHalf}>
        <RtcSurfaceView 
          style={styles.halfVideo} 
          canvas={{ uid: 0 }} 
          renderMode={1}
          zOrderMediaOverlay={false}
        />
        <View style={styles.videoNameTag}>
          <Text style={styles.videoNameText}>{userName} (Host)</Text>
        </View>
      </View>
      
      {/* Caller Video - Bottom Half */}
<View style={styles.callerVideoHalf}>
  {currentCall?.callerAgoraUid && remoteUsers.has(currentCall.callerAgoraUid) ? (
    <>
      {console.log('✅ Rendering caller video with UID:', currentCall.callerAgoraUid)}
      {console.log('📝 Remote users available:', Array.from(remoteUsers.keys()))}
      <RtcSurfaceView 
        style={styles.halfVideo} 
        canvas={{ uid: currentCall.callerAgoraUid }} 
        zOrderMediaOverlay={true}
        renderMode={1}
      />
      <View style={styles.videoNameTag}>
        <Text style={styles.videoNameText}>{currentCall.userName} (Caller)</Text>
        <Text style={styles.videoNameText}>UID: {currentCall.callerAgoraUid}</Text>
      </View>
    </>
  ) : (
    <View style={styles.videoPlaceholder}>
      <ActivityIndicator size="large" color="#f6b900" />
      <Text style={styles.videoPlaceholderText}>
        {currentCall?.callerAgoraUid 
          ? `Looking for UID ${currentCall.callerAgoraUid}...` 
          : 'Waiting for caller to join...'}
      </Text>
      <Text style={styles.videoPlaceholderText}>
        Available UIDs: {Array.from(remoteUsers.keys()).join(', ') || 'None'}
      </Text>
      <Text style={styles.videoPlaceholderText}>
        Expected: {currentCall?.callerAgoraUid || 'None'}
      </Text>
    </View>
  )}
</View>
    </View>
  ) : (
    // ✅ Full screen - normal streaming
    <RtcSurfaceView 
      style={styles.video} 
      canvas={{ uid: 0 }} 
      renderMode={1}
      zOrderMediaOverlay={false}
    />
  )
) : (
  <View style={styles.noVideo}>
    <Icon name="videocam-off" size={64} color="#fff" />
    <Text style={styles.noVideoText}>Camera Off</Text>
  </View>
)}
{/* ✅ Debug Overlay (remove in production) */}
{__DEV__ && currentCall && (
  <View style={styles.debugOverlay}>
    <Text style={styles.debugText}>🔍 Call Debug</Text>
    <Text style={styles.debugText}>Caller Name: {currentCall.userName}</Text>
    <Text style={styles.debugText}>Caller UID: {currentCall.callerAgoraUid || 'Not set'}</Text>
    <Text style={styles.debugText}>Call Type: {currentCall.callType}</Text>
    <Text style={styles.debugText}>isOnCall: {String(currentCall.isOnCall)}</Text>
    <Text style={styles.debugText}>Remote Users: {remoteUsers.size}</Text>
    <Text style={styles.debugText}>
      UIDs: {Array.from(remoteUsers.keys()).join(', ') || 'None'}
    </Text>
  </View>
)}

        {/* Active Call Card */}
        {currentCall && (
          <View style={styles.activeCallOverlay}>
            <View style={styles.callInfoCard}>
              <View style={styles.callHeader}>
                <View style={styles.callAvatar}>
                  <Text style={styles.callAvatarText}>{currentCall.userName?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.callDetails}>
                  <Text style={styles.callName}>{currentCall.userName}</Text>
                  <View style={styles.callTypeIndicator}>
                    <Icon name={currentCall.callType === 'video' ? 'videocam' : 'call'} size={12} color="#10b981" />
                    <Text style={styles.callTypeLabel}>
                      {currentCall.callMode === 'public' ? '🌐' : '🔒'} {currentCall.callType === 'video' ? 'Video' : 'Voice'}
                    </Text>
                  </View>
                </View>
                <View style={styles.callTimer}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.timerText}>{formatCallDuration(callTimer)}</Text>
                </View>
              </View>
              <View style={styles.callCharges}>
                <Icon name="attach-money" size={16} color="#10b981" />
                <Text style={styles.chargesText}>
                  ₹{Math.floor(callTimer / 60) * (currentCall.callType === 'video' ? callSettings.videoCallPrice : callSettings.voiceCallPrice)}
                </Text>
              </View>
              <TouchableOpacity style={styles.endCallButton} onPress={() => Alert.alert('End Call', 'Are you sure?', [{ text: 'Cancel' }, { text: 'End', onPress: endCurrentCall }])}>
                <Icon name="call-end" size={20} color="#fff" />
                <Text style={styles.endCallText}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top Controls */}
        {showControls && (
          <View style={styles.topControls}>
            <View style={styles.userBubble}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconRound} onPress={toggleMic}>
                <Icon name={isMicEnabled ? 'mic' : 'mic-off'} size={20} color={isMicEnabled ? '#000' : '#ef4444'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconRound} onPress={toggleCamera}>
                <Icon name={isCameraEnabled ? 'videocam' : 'videocam-off'} size={20} color={isCameraEnabled ? '#000' : '#ef4444'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconRound} onPress={switchCamera}>
                <Icon name="switch-camera" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconRound} onPress={handleEndStream}>
                <Icon name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Left Side Info */}
        <View style={styles.leftSide}>
          <TouchableOpacity style={styles.viewerCard}>
            <Icon name="visibility" size={18} color="#fff" />
            <Text style={styles.viewerText}>{viewerCount}</Text>
          </TouchableOpacity>
          {callWaitlist.length > 0 && (
            <TouchableOpacity style={styles.waitlistBtn} onPress={() => setShowWaitlistModal(true)}>
              <Icon name="queue" size={20} color="#fff" />
              <Text style={styles.waitlistBadge}>{callWaitlist.length}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Gift Animations */}
        {activeGifts.map((gift) => (
          <Animated.View key={gift.id} style={[styles.giftAnimation, { opacity: giftAnimValue, transform: [{ translateY: giftAnimValue.interpolate({ inputRange: [0, 1], outputRange: [100, -100] }) }] }]}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <Text style={styles.giftText}>{gift.userName}</Text>
            <Text style={styles.giftAmount}>₹{gift.amount}</Text>
          </Animated.View>
        ))}

        {/* Chat Messages */}
        <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
          {messages.slice(-10).map((msg) => (
            <View key={msg.id} style={styles.chatMessage}>
              {msg.type === 'comment' && (<><Text style={styles.chatUser}>{msg.userName}: </Text><Text style={styles.chatText}>{msg.message}</Text></>)}
              {msg.type === 'join' && (<Text style={styles.chatSystem}>👋 {msg.userName} joined</Text>)}
              {msg.type === 'like' && (<Text style={styles.chatSystem}>❤️ {msg.userName} liked</Text>)}
              {msg.type === 'gift' && (<Text style={styles.chatGift}>🎁 {msg.userName} sent {msg.giftName} (₹{msg.amount})</Text>)}
              {msg.type === 'call_request' && (<Text style={styles.chatSystem}>📞 {msg.userName} requested {msg.callType} call</Text>)}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.inputWrap}>
            <TextInput placeholder="Say Hi..." placeholderTextColor="#999" style={styles.input} value={chatInput} onChangeText={setChatInput} />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCallSettingsModal(true)}>
            <Icon name="settings" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Waitlist Modal */}
      <Modal visible={showWaitlistModal} transparent animationType="slide" onRequestClose={() => setShowWaitlistModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Call Waitlist ({callWaitlist.length})</Text>
              <TouchableOpacity onPress={() => setShowWaitlistModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={callWaitlist}
              keyExtractor={(item) => item.userId}
              renderItem={({ item, index }) => (
                <View style={styles.waitlistItem}>
                  <View style={styles.waitlistLeft}>
                    <Text style={styles.waitlistPosition}>#{index + 1}</Text>
                    <View>
                      <Text style={styles.waitlistName}>{item.userName}</Text>
                      <Text style={styles.waitlistType}>
                        {item.callType === 'video' ? '📹' : '📞'} {item.callType} • {item.callMode === 'public' ? '🌐' : '🔒'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.waitlistActions}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptCall(item)}>
                      <Icon name="check" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectCall(item)}>
                      <Icon name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No pending requests</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showCallSettingsModal} transparent animationType="slide" onRequestClose={() => setShowCallSettingsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Call Settings</Text>
              <TouchableOpacity onPress={() => setShowCallSettingsModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Voice Call</Text>
              <Text style={styles.settingValue}>₹{callSettings?.voiceCallPrice || 50}/min</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Video Call</Text>
              <Text style={styles.settingValue}>₹{callSettings?.videoCallPrice || 100}/min</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Public Calls</Text>
              <Text style={styles.settingValue}>{callSettings?.allowPublicCalls ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Private Calls</Text>
              <Text style={styles.settingValue}>{callSettings?.allowPrivateCalls ? 'Enabled' : 'Disabled'}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { flex: 1, position: 'relative' },
  video: { flex: 1 },
  noVideo: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  noVideoText: { color: '#fff', fontSize: 16, marginTop: 16 },
  
  // Split screen
  splitScreenContainer: { flex: 1, flexDirection: 'column' },
  hostVideoHalf: { flex: 1, backgroundColor: '#000', borderBottomWidth: 2, borderBottomColor: '#FFB300', position: 'relative' },
  callerVideoHalf: { flex: 1, backgroundColor: '#1a1a1a', position: 'relative' },
  halfVideo: { width: '100%', height: '100%' },
  videoNameTag: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  videoNameText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  videoPlaceholderText: { color: '#fff', fontSize: 14, marginTop: 12 },
  
  // Active call overlay
  activeCallOverlay: { position: 'absolute', top: 80, left: 16, right: 16, zIndex: 100 },
  callInfoCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  callHeader: { flexDirection: 'row', alignItems: 'center' },
  callAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  callAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  callDetails: { flex: 1, marginLeft: 12 },
  callName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  callTypeIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  callTypeLabel: { fontSize: 11, color: '#10b981', marginLeft: 4 },
  callTimer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  recordingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
  timerText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  callCharges: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingVertical: 6, backgroundColor: '#F0FDF4', borderRadius: 8 },
  chargesText: { fontSize: 14, fontWeight: '600', color: '#10b981', marginLeft: 4 },
  endCallButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  endCallText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  
  // Top controls
  topControls: { position: 'absolute', top: Platform.OS === 'ios' ? 20 : 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userBubble: { backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  userName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  topActions: { flexDirection: 'row', alignItems: 'center' },
  iconRound: { backgroundColor: 'rgba(255,255,255,0.9)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  
  // Left side
  leftSide: { position: 'absolute', left: 12, top: height * 0.25, alignItems: 'flex-start' },
  viewerCard: { backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginBottom: 12 },
  viewerText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  waitlistBtn: { backgroundColor: 'rgba(249,115,22,0.9)', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  waitlistBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, textAlign: 'center' },
  
  // Gift animation
  giftAnimation: { position: 'absolute', right: 16, top: height * 0.3, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  giftEmoji: { fontSize: 48 },
  giftText: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 4 },
  giftAmount: { color: '#FFB300', fontSize: 16, fontWeight: '700', marginTop: 2 },
  
  // Chat
  chatContainer: { position: 'absolute', bottom: 100, left: 12, right: 12, maxHeight: 200 },
  chatMessage: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start', maxWidth: '80%' },
  chatUser: { color: '#FFB300', fontSize: 13, fontWeight: '700' },
  chatText: { color: '#fff', fontSize: 13 },
  chatSystem: { color: '#9ca3af', fontSize: 12, fontStyle: 'italic' },
  chatGift: { color: '#FFB300', fontSize: 13, fontWeight: '600' },
  
  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center' },
  inputWrap: { flex: 1, position: 'relative' },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, paddingRight: 48, color: '#fff', fontSize: 14 },
  sendBtn: { position: 'absolute', right: 4, top: '50%', transform: [{ translateY: -18 }], width: 36, height: 36, borderRadius: 18, backgroundColor: '#9b59b6', alignItems: 'center', justifyContent: 'center' },
  actionBtn: { marginLeft: 8, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 40, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  
  // Waitlist
  waitlistItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  waitlistLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  waitlistPosition: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFB300', color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center', lineHeight: 32, marginRight: 12 },
  waitlistName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  waitlistType: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  waitlistActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 14, marginTop: 24 },
  
  // Settings
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingLabel: { fontSize: 15, color: '#374151', fontWeight: '500' },
  settingValue: { fontSize: 15, color: '#111827', fontWeight: '600' },

  debugOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 12,
    borderRadius: 8,
    maxWidth: width - 32,
    zIndex: 999,
  },
  
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
  
  // ✅ Update video styles with explicit dimensions
  video: { 
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  
  halfVideo: { 
    width: '100%', 
    height: '100%',
    backgroundColor: '#000',
  },
  
  splitScreenContainer: { 
    flex: 1, 
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  
  hostVideoHalf: { 
    flex: 1, 
    backgroundColor: '#000', 
    borderBottomWidth: 2, 
    borderBottomColor: '#FFB300', 
    position: 'relative',
    width: '100%',
  },
  
  callerVideoHalf: { 
    flex: 1, 
    backgroundColor: '#1a1a1a', 
    position: 'relative',
    width: '100%',
  },
});
