import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import AstrologerChatSocket from '../../services/socket/AstrologerChatSocket'; // Ensure this wraps socket.io-client
import ChatService from '../../services/api/chat/ChatService';

const AstroChatRoom = ({ route, navigation }) => {
  const { state: { astrologer } } = useAuth();
  const astrologerId = astrologer?._id || astrologer?.id;

  const { sessionId, orderId, userId, userName, userProfilePicture } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('waiting'); 

  const flatListRef = useRef(null);

  const formatTime = (seconds) => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ===== 1. LOAD DATA =====
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ChatService.getSessionMessages(sessionId, 1, 50);
      if (res.success && res.data) {
        const formatted = (res.data.messages || []).map((msg) => ({
          _id: msg.messageId,
          text: msg.content,
          isMe: msg.senderModel === 'Astrologer',
          timestamp: msg.sentAt,
          type: msg.type,
          kundliDetails: msg.kundliDetails,
        }));
        setMessages(formatted); // API likely returns newest first, so we use inverted list or reverse here
      }
    } catch (e) {
      console.log('Error loading messages', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // ===== 2. SOCKET SETUP =====
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      console.log('🔌 Astrologer Joining Session:', sessionId);
      
      // Join Room
      AstrologerChatSocket.emit('join_session', { sessionId, userId: astrologerId, role: 'astrologer' });
      
      // Request Timer Sync (in case joining late)
      AstrologerChatSocket.emit('sync_timer', { sessionId });

      // -- Listeners --
      AstrologerChatSocket.on('chat_message', (msg) => {
        if (msg.sessionId !== sessionId) return;

        setMessages((prev) => {
          if (prev.some((m) => m._id === msg.messageId)) return prev;

          // Replace optimistic message
          if (msg.senderModel === 'Astrologer') {
            const idx = prev.findIndex(m => m.isMe && m._id.startsWith('temp-') && m.text === msg.content);
            if (idx > -1) {
              const newArr = [...prev];
              newArr[idx] = { ...newArr[idx], _id: msg.messageId, timestamp: msg.sentAt };
              return newArr;
            }
          }

          return [{
            _id: msg.messageId,
            text: msg.content,
            isMe: msg.senderModel === 'Astrologer',
            timestamp: msg.sentAt,
            type: msg.type,
            kundliDetails: msg.kundliDetails
          }, ...prev];
        });
      });

      // Timer Start: This is the signal that user joined and chat is active
      AstrologerChatSocket.on('timer_start', (data) => {
        if (data.sessionId === sessionId) {
          console.log('✅ Chat Active');
          setIsActive(true);
          setSessionStatus('active');
          setSecondsLeft(data.maxDurationSeconds);
        }
      });

      // Timer Tick
      AstrologerChatSocket.on('timer_tick', (data) => {
        if (data.remainingSeconds !== undefined) {
          setSecondsLeft(data.remainingSeconds);
          // Auto-activate if we missed the start event
          if (!isActive && data.remainingSeconds > 0) {
            setIsActive(true);
            setSessionStatus('active');
          }
        }
      });

      const handleEnd = () => {
        setIsActive(false);
        setSessionStatus('ended');
        Alert.alert('Ended', 'Session has ended.');
      };

      AstrologerChatSocket.on('timer_ended', handleEnd);
      AstrologerChatSocket.on('chat_ended', handleEnd);
    };

    initSocket();
    loadInitialData();

    return () => {
      mounted = false;
      AstrologerChatSocket.off('chat_message');
      AstrologerChatSocket.off('timer_start');
      AstrologerChatSocket.off('timer_tick');
      AstrologerChatSocket.off('chat_ended');
      AstrologerChatSocket.off('timer_ended');
    };
  }, [sessionId, astrologerId, loadInitialData]);

  // ===== 3. SEND MESSAGE =====
  const sendMessage = () => {
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [{
      _id: tempId,
      text: content,
      isMe: true,
      timestamp: new Date().toISOString(),
      type: 'text'
    }, ...prev]);

    AstrologerChatSocket.emit('send_message', {
      sessionId,
      orderId,
      senderId: astrologerId,
      senderModel: 'Astrologer',
      receiverId: userId,
      receiverModel: 'User',
      type: 'text',
      content
    });
  };

  const endChat = () => {
    Alert.alert('End Session', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => {
          AstrologerChatSocket.emit('end_chat', { 
            sessionId, 
            userId: astrologerId, // passing as userId for the handler
            reason: 'astrologer_ended' 
          });
          navigation.goBack();
      }}
    ]);
  };

  // ===== RENDER =====
  const renderItem = ({ item }) => {
    if (item.type === 'kundli_details' && item.kundliDetails) {
       return (
        <View style={styles.kundliContainer}>
          <Text style={styles.kundliTitle}>📜 User Kundli</Text>
          <Text style={styles.kundliText}>{item.kundliDetails.name}, {item.kundliDetails.gender}</Text>
          <Text style={styles.kundliText}>{item.kundliDetails.dob} at {item.kundliDetails.birthTime}</Text>
          <Text style={styles.kundliText}>{item.kundliDetails.birthPlace}</Text>
        </View>
       );
    }
    return (
      <View style={[styles.messageBubble, item.isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, item.isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
           <Image source={{ uri: userProfilePicture || 'https://via.placeholder.com/40' }} style={styles.avatar} />
           <Text style={styles.userName}>{userName || 'User'}</Text>
        </View>
        <View style={styles.timerContainer}>
           <Text style={styles.timerText}>
             {isActive ? formatTime(secondsLeft) : sessionStatus === 'waiting' ? 'WAITING' : 'ENDED'}
           </Text>
        </View>
        <TouchableOpacity onPress={endChat} style={styles.endButton}>
           <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        inverted
        contentContainerStyle={styles.listContent}
      />

      {(isActive || sessionStatus === 'waiting') ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {sessionStatus === 'waiting' && (
            <Text style={styles.waitingText}>Waiting for user to join...</Text>
          )}
          <View style={[styles.inputContainer, sessionStatus === 'waiting' && { opacity: 0.5 }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              editable={isActive} // Disable input until user joins
            />
            <TouchableOpacity onPress={sendMessage} disabled={!isActive || !input.trim()} style={styles.sendButton}>
               <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.footerBanner}><Text style={{color:'#fff'}}>Chat ended</Text></View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121b22' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#FFD700' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex:1 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  userName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  timerContainer: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  timerText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },
  endButton: { backgroundColor: '#ff4d4d', padding: 6, borderRadius: 6, marginLeft: 10 },
  endButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listContent: { paddingHorizontal: 10, paddingVertical: 20 },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 8, marginVertical: 4 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#005c4b' },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#1f2c34' },
  messageText: { fontSize: 15 },
  myText: { color: '#fff' },
  theirText: { color: '#fff' },
  timestamp: { fontSize: 10, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end', marginTop: 2 },
  kundliContainer: { alignSelf: 'center', width: '85%', backgroundColor: '#fffbe6', borderRadius: 8, padding: 10, marginVertical: 10, borderLeftWidth: 4, borderLeftColor: '#E65100' },
  kundliTitle: { fontWeight: 'bold', color: '#E65100' },
  kundliText: { color: '#333', fontSize: 13 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#1f2c34' },
  input: { flex: 1, backgroundColor: '#2a3942', color: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendButton: { backgroundColor: '#00a884', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  waitingText: { textAlign: 'center', color: '#8696a0', fontSize: 12, paddingBottom: 4, backgroundColor: '#1f2c34' },
  footerBanner: { padding: 15, backgroundColor: '#333', alignItems: 'center' },
});

export default AstroChatRoom;