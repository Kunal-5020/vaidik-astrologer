// src/screens/chat/AstroHistoryChatScreen.js

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Clipboard,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import ChatService from '../../services/api/chat/ChatService';
import orderService from '../../services/api/orderService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const AstroHistoryChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { astrologer } = useAuth();
  const astrologerId = astrologer?._id || astrologer?.id;

  // Route params
  const { orderId } = route.params;

  // State
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);

  const flatListRef = useRef(null);

  // ✅ Load Data
  const loadHistory = useCallback(async () => {
    if (!orderId) {
      Alert.alert("Error", "Invalid Order ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [chatRes, orderRes] = await Promise.all([
        ChatService.getConversationHistory(orderId),
        orderService.getOrderDetails(orderId, astrologerId),
      ]);

      // --- 1. Message Extraction ---
      let msgs = [];
      let meta = {};

      if (Array.isArray(chatRes)) {
        msgs = chatRes;
      } else if (chatRes?.data?.messages) {
        msgs = chatRes.data.messages;
        meta = chatRes.data.meta || {};
      } else if (chatRes?.messages) {
        msgs = chatRes.messages;
        meta = chatRes.meta || {};
      } else if (chatRes?.data && Array.isArray(chatRes.data)) {
        msgs = chatRes.data;
      }

      const privacy = meta?.user?.privacy || {};
      const userMeta = meta?.user || {};

      // Privacy Check
      if (privacy?.restrictions?.astrologerChatAccessAfterEnd === false) {
        setAccessBlocked(true);
        return; 
      }

      // --- 2. Format Messages ---
      const formattedMessages = msgs.map((msg) => {
        const senderIdRaw = msg.senderId;
        const senderId = senderIdRaw?._id || senderIdRaw; 
        
        return {
          id: msg._id || msg.messageId,
          text: msg.content,
          user: {
            id: senderId,
            name: msg.senderModel === 'User' ? 'User' : 'Astrologer',
          },
          timestamp: msg.sentAt || msg.createdAt,
          type: msg.type || 'text',
          isStarred: msg.isStarred || false,
          mediaUrl: msg.mediaUrl || msg.url,
          mediaType: msg.mediaType || msg.type,
          kundliDetails: msg.kundliDetails,
          senderModel: msg.senderModel 
        };
      });

      // --- 3. Explicit Sorting (Oldest First) ---
      formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(formattedMessages);
      setUserData(userMeta);

      if (orderRes.data) {
          setChatPartner(orderRes.data.userId); 
      }

    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [orderId, astrologerId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // --- Actions ---
  const copyMessage = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleMediaPress = (mediaUrl, mediaType) => {
    navigation.navigate('MediaViewer', { 
      mediaUrl, 
      mediaType, 
    });
  };

const handleSuggestRemedies = () => {
    const targetUser = userData || chatPartner;
    if (!targetUser) {
      Alert.alert('Error', 'User details not found');
      return;
    }

    navigation.navigate('SuggestRemedies', { 
      userId: targetUser._id || targetUser.id,
      orderId: orderId,
      userName: targetUser.name || 'User',
      sessionType: 'chat', // or 'history' for context
    });
  };

  // --- Render Items ---
  const renderDateSeparator = (date) => (
    <View style={styles.dateSeparator}>
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );

  const groupMessages = (msgs) => {
    const grouped = [];
    let lastDate = null;
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (date !== lastDate) {
        grouped.push({ type: 'date', date, id: `date-${date}` });
        lastDate = date;
      }
      grouped.push(msg);
    });
    return grouped;
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
        const dateObj = new Date(item.date);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let label = item.date === today ? 'Today' : item.date === yesterday ? 'Yesterday' : dateObj.toLocaleDateString();
        return renderDateSeparator(label);
    }

    const isMe = item.senderModel === 'Astrologer'; 
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => Alert.alert('Options', item.text, [{ text: 'Copy', onPress: () => copyMessage(item.text) }, { text: 'Cancel' }])}
        style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
            {/* Star Indicator */}
            {item.isStarred && (
                <View style={styles.starIcon}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                </View>
            )}

            {/* Media Content */}
            {item.mediaType === 'image' && (
                <TouchableOpacity onPress={() => handleMediaPress(item.mediaUrl, 'image')}>
                    <Image source={{ uri: item.mediaUrl }} style={styles.mediaImg} />
                </TouchableOpacity>
            )}
            
            {/* Text Content */}
            {item.text ? (
                <Text style={styles.msgText}>{item.text}</Text>
            ) : null}

            {/* Metadata (Time + Ticks) */}
            <View style={styles.metaContainer}>
                <Text style={styles.timeText}>{time}</Text>
                {isMe && (
                    <Ionicons name="checkmark-done" size={14} color="#34B7F1" style={{ marginLeft: 4 }} />
                )}
            </View>

            {/* Tail Triangles */}
            {isMe ? <View style={styles.rightTail} /> : <View style={styles.leftTail} />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  if (accessBlocked) {
      return (
          <View style={[styles.container, styles.center]}>
              <Ionicons name="lock-closed-outline" size={60} color="#EF4444" />
              <Text style={styles.blockedText}>Access Restricted by User</Text>
          </View>
      )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>
            
            <Image 
                source={{ uri: userData?.profileImage || userData?.profilePicture || 'https://via.placeholder.com/40' }} 
                style={styles.headerAvatar} 
            />
            
            <View>
                <Text style={styles.headerTitle}>{userData?.name || 'User'}</Text>
                <Text style={styles.headerSubtitle}>History Viewer</Text>
            </View>
        </View>

        {/* Suggest Remedies Button */}
        <TouchableOpacity style={styles.remedyBtn} onPress={handleSuggestRemedies}>
             <Ionicons name="medkit-outline" size={18} color="#fff" />
             <Text style={styles.remedyBtnText}>Suggest Remedies</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Chat Area */}
      <ImageBackground
        source={require('../../assets/onlyLogoVaidik.png')}
        style={styles.chatBackground}
        imageStyle={{ opacity: 0.15, resizeMode: 'center' }} // Faded logo in center
        resizeMode="cover"
      >
        <FlatList
          ref={flatListRef}
          data={groupMessages(messages)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 8, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { justifyContent: 'center', alignItems: 'center' },
  blockedText: { marginTop: 16, fontSize: 16, color: '#374151' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6B7280' },

  remedyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B', // Amber color for remedies
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      gap: 5,
  },
  remedyBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
  },

  // Chat Area
  chatBackground: { flex: 1, backgroundColor: '#ECE5DD' },
  
  // Date Separator
  dateSeparator: { alignItems: 'center', marginVertical: 12 },
  datePill: {
    backgroundColor: '#E1F3FB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
  },
  dateText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },

  // Messages
  msgRow: { marginVertical: 2, flexDirection: 'row', alignItems: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },

  bubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 20,
    borderRadius: 8,
    elevation: 1,
    position: 'relative',
  },
  bubbleLeft: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0 },
  bubbleRight: { backgroundColor: '#D9FDD3', borderTopRightRadius: 0 },

  msgText: { fontSize: 15, color: '#111827', lineHeight: 20 },
  
  metaContainer: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: { fontSize: 10, color: '#6B7280' },

  mediaImg: { width: 200, height: 200, borderRadius: 6, marginBottom: 4 },

  starIcon: { position: 'absolute', top: -4, left: -4, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 2, zIndex: 10, borderWidth: 1, borderColor: '#FCD34D' },

  // Tails
  leftTail: {
    position: 'absolute',
    top: 0,
    left: -8,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: '#FFFFFF',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
  },
  rightTail: {
    position: 'absolute',
    top: 0,
    right: -8,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: '#D9FDD3',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
  },
});

export default AstroHistoryChatScreen;