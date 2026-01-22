// src/screens/CallChatSection/AstroHistoryChatScreen.js

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Clipboard,
  Image,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../component/ScreenWrapper'; // Unified Wrapper
import ChatService from '../../services/api/chat/ChatService';
import orderService from '../../services/api/orderService';
import { useAuth } from '../../contexts/AuthContext';
import AudioMessageBubble from '../../component/chat/AudioMessageBubble';
import { styles, COLORS } from '../../style/AstroHistoryChatStyle';

const AstroHistoryChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const { astrologer } = useAuth();
  const astrologerId = astrologer?._id || astrologer?.id;
  const { orderId } = route.params;

  // Data State
  const [messages, setMessages] = useState([]); // Stores [Newest ... Oldest]
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [privacySettings, setPrivacySettings] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const flatListRef = useRef(null);

  // Helper: Format Message Object
  const formatMessage = (msg) => {
    const senderIdRaw = msg.senderId;
    const senderId = senderIdRaw?._id || senderIdRaw;
    const type = msg.type || 'text';
    const mediaUrl = msg.fileUrl || msg.mediaUrl || msg.url || null;
    const isTextLike = type === 'text' || type === 'kundli_details';

    return {
      id: msg._id || msg.messageId,
      text: isTextLike ? msg.content : '',
      user: {
        id: senderId,
        name: msg.senderModel === 'User' ? 'User' : 'Astrologer',
      },
      timestamp: msg.sentAt || msg.createdAt,
      type,
      isStarred: msg.isStarred || false,
      mediaUrl,
      thumbnailUrl: msg.thumbnailUrl || null,
      mimeType: msg.mimeType || null,
      fileDuration: msg.fileDuration || null,
      fileName: msg.fileName || null,
      fileSize: msg.fileSize || null,
      kundliDetails: msg.kundliDetails,
      senderModel: msg.senderModel,
    };
  };

  // 1. Initial Load (Page 1)
  const loadInitialHistory = useCallback(async () => {
    if (!orderId) {
      Alert.alert('Error', 'Invalid Order ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch Page 1 with limit 20
      const [chatRes, orderRes] = await Promise.all([
        ChatService.getConversationMessages(orderId, 1, 20),
        orderService.getOrderDetails(orderId, astrologerId),
      ]);

      let msgs = [];
      let meta = {};
      let pagination = {};

      // Handle Chat Response Structure
      if (chatRes.success) {
        msgs = chatRes.data?.messages || [];
        meta = chatRes.data?.meta || {};
        pagination = chatRes.data?.pagination || {};
      } else if (Array.isArray(chatRes)) {
        // Fallback for older API format
        msgs = chatRes; 
      }

      // Check Privacy
      const privacy = meta?.user?.privacy || {};
      const userMeta = meta?.user || {};

      if (privacy?.restrictions?.astrologerChatAccessAfterEnd === true) {
        setAccessBlocked(true);
        setPrivacySettings(privacy);
        setLoading(false);
        return;
      }

      // Process Messages (Server sends Oldest->Newest, we need Newest->Oldest for Inverted List)
      const formattedMessages = msgs.map(formatMessage).reverse();

      setMessages(formattedMessages);
      setUserData(userMeta);
      setPrivacySettings(privacy);
      
      // Update Pagination State
      setPage(pagination.page || 1);
      setHasMore((pagination.page || 1) < (pagination.pages || 1));

      if (orderRes.data) {
        setChatPartner(orderRes.data.userId);
      }

    } catch (error) {
      console.error('❌ Load error:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [orderId, astrologerId]);

  useEffect(() => {
    loadInitialHistory();
  }, [loadInitialHistory]);

  // 2. Load More (Pagination)
  const loadMoreHistory = async () => {
    if (!hasMore || isFetchingMore || loading) return;

    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;

      const res = await ChatService.getConversationMessages(orderId, nextPage, 20);

      if (res.success) {
        const serverMessages = res.data?.messages || [];
        const formattedNewMessages = serverMessages.map(formatMessage).reverse();

        setMessages((prev) => [...prev, ...formattedNewMessages]);
        
        const pagination = res.data?.pagination || {};
        setPage(pagination.page);
        setHasMore(pagination.page < pagination.pages);
      }
    } catch (error) {
      console.error('❌ Load more error:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Group Messages (Adapted for Inverted List)
  const groupMessagesForInvertedList = useCallback((msgs) => {
    const grouped = [];
    
    for (let i = 0; i < msgs.length; i++) {
      const currentMsg = msgs[i];
      const nextMsg = msgs[i + 1]; // "Next" in array is "Older" in time

      grouped.push(currentMsg);

      const currentDate = new Date(currentMsg.timestamp).toDateString();
      const nextDate = nextMsg ? new Date(nextMsg.timestamp).toDateString() : null;

      if (currentDate !== nextDate) {
        grouped.push({ 
          type: 'date', 
          date: currentDate, 
          id: `date-${currentDate}-${i}` 
        });
      }
    }
    return grouped;
  }, []);

  const groupedData = useMemo(() => groupMessagesForInvertedList(messages), [messages, groupMessagesForInvertedList]);

  // Action Handlers
  const copyMessage = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const handleMediaPress = (mediaUrl, mediaType) => {
    navigation.navigate('MediaViewer', { mediaUrl, mediaType });
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
      sessionType: 'chat',
    });
  };

  const handleViewSuggestions = () => {
    const targetUser = userData || chatPartner;
    navigation.navigate('AstrologerSuggestedRemedies', {
      orderId: orderId,
      userName: targetUser?.name || 'User',
    });
  };

  const formatDuration = (sec = 0) => {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Render Items
  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      const dateObj = new Date(item.date);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let label =
        item.date === today
          ? 'Today'
          : item.date === yesterday
          ? 'Yesterday'
          : dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
      
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{label}</Text>
          </View>
        </View>
      );
    }

    const isMe = item.senderModel === 'Astrologer';
    const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const showImage = item.type === 'image' && item.mediaUrl;
    const showVideo = item.type === 'video' && item.mediaUrl;
    const showAudio = (item.type === 'audio' || item.type === 'voice_note') && item.mediaUrl;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() =>
          item.text
            ? Alert.alert('Options', item.text, [
                { text: 'Copy', onPress: () => copyMessage(item.text) },
                { text: 'Cancel' },
              ])
            : null
        }
        style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          {item.isStarred && (
            <View style={styles.starIcon}>
              <Ionicons name="star" size={12} color={COLORS.ACCENT} />
            </View>
          )}

          {/* Audio */}
          {showAudio && (
            <View style={styles.audioWrapper}>
              <AudioMessageBubble
                url={item.mediaUrl}
                durationSec={item.fileDuration}
                isOutgoing={isMe}        
                bubbleBg={isMe ? COLORS.BUBBLE_ASTRO : COLORS.BUBBLE_USER}
                waveColor={isMe ? COLORS.PRIMARY : COLORS.SECONDARY}
                playIconColor={isMe ? COLORS.PRIMARY : COLORS.SECONDARY}
              />
            </View>
          )}

          {/* Image */}
          {showImage && (
            <TouchableOpacity
              onPress={() => handleMediaPress(item.mediaUrl, 'image')}
              style={styles.imageContainer}
            >
              <Image source={{ uri: item.mediaUrl }} style={styles.mediaImg} />
            </TouchableOpacity>
          )}

          {/* Video */}
          {showVideo && (
            <TouchableOpacity
              onPress={() => handleMediaPress(item.mediaUrl, 'video')}
              style={styles.videoContainer}
            >
              <Image
                source={{ uri: item.thumbnailUrl || item.mediaUrl }}
                style={styles.videoThumbnail}
              />
              <View style={styles.videoPlayOverlay}>
                <View style={styles.playCircle}>
                  <Ionicons name="play" size={24} color="#FFF" />
                </View>
              </View>
              {item.fileDuration ? (
                <View style={styles.videoDurationBadge}>
                  <Text style={styles.videoDurationText}>
                    {formatDuration(item.fileDuration)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )}

          {/* Kundli Details */}
          {item.type === 'kundli_details' && item.kundliDetails && (
            <View style={styles.kundliCard}>
              <Text style={styles.kundliTitle}>📜 Kundli Details</Text>
              <Text style={styles.kundliText}>{item.kundliDetails.name}</Text>
              <Text style={styles.kundliText}>{item.kundliDetails.dob}</Text>
            </View>
          )}

          {/* Text Message */}
          {item.text ? <Text style={styles.msgText}>{item.text}</Text> : null}

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <Text style={styles.timeText}>{time}</Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={COLORS.SUCCESS}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          {/* Bubble Tails */}
          {isMe ? <View style={styles.rightTail} /> : <View style={styles.leftTail} />}
        </View>
      </TouchableOpacity>
    );
  };

  // 3. Render Loading State
  if (loading) {
    return (
      <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading chat history...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // 4. Render Blocked State
  if (accessBlocked) {
    return (
      <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        <View style={[styles.container, styles.center]}>
          <View style={styles.blockedContainer}>
            <View style={styles.blockedIconContainer}>
              <Ionicons name="lock-closed" size={60} color={COLORS.DANGER} />
            </View>
            <Text style={styles.blockedTitle}>Access Restricted</Text>
            <Text style={styles.blockedText}>
              The user has restricted access to this chat history.
            </Text>
            <Text style={styles.blockedSubtext}>
              This is a privacy setting enabled by the user.
            </Text>
            <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.goBackBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
                <Image
                source={{
                    uri:
                    userData?.profileImage ||
                    userData?.profilePicture ||
                    'https://via.placeholder.com/40',
                }}
                style={styles.headerAvatar}
                />
            </View>

            <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                {userData?.name || 'User'}
                </Text>
                <Text style={styles.headerSubtitle}>Chat History</Text>
            </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleViewSuggestions}>
                <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.remedyBtn} onPress={handleSuggestRemedies}>
                <Ionicons name="medical" size={16} color="#FFF" />
                <Text style={styles.remedyBtnText}>Suggest</Text>
            </TouchableOpacity>
            </View>
        </View>

        {/* Chat Area */}
        <ImageBackground
            source={require('../../assets/onlyLogoVaidik.png')}
            style={styles.chatBackground}
            imageStyle={{ opacity: 0.05, resizeMode: 'center' }}
            resizeMode="cover"
        >
            <FlatList
            ref={flatListRef}
            data={groupedData}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            
            // ✅ Inverted List Logic
            inverted={true}
            onEndReached={loadMoreHistory}
            onEndReachedThreshold={0.3}
            ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{marginVertical: 10}} /> : null}

            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}> 
                {/* Fix empty component rotation in inverted list */}
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.TEXT_LIGHT} />
                <Text style={styles.emptyText}>No messages found</Text>
                </View>
            }
            />
        </ImageBackground>

        {/* Footer Info */}
        <View style={styles.footer}>
            <Ionicons name="lock-closed" size={14} color={COLORS.TEXT_LIGHT} />
            <Text style={styles.footerText}>
            {privacySettings?.restrictions?.astrologerChatAccessAfterEnd === false
                ? 'User allowed access to chat history'
                : 'Chat history viewer'}
            </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default AstroHistoryChatScreen;