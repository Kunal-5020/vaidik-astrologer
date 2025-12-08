// src/screens/chat/AstroChatRoom.js

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
  Clipboard,
  Image,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import AstrologerChatSocket from '../../services/socket/AstrologerChatSocket';
import ChatService from '../../services/api/chat/ChatService';

const AstroChatRoom = ({ route, navigation }) => {
  const {
    state: { astrologer },
  } = useAuth();
  const astrologerId = astrologer?._id || astrologer?.id;

  const { sessionId, orderId, userId, userName, userProfilePicture } =
    route.params || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef(null);
  const listenersAttached = useRef(false);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ========= LOAD MESSAGES VIA API (no socket) =========
  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      console.log('📂 [Astro] Loading messages for session:', sessionId);
      const data = await ChatService.getSessionMessages(sessionId, 1, 50);

      const formatted =
        (data?.messages || []).map((msg) => ({
          _id: msg.messageId || msg._id || String(Date.now()),
          text: msg.content,
          user: {
            _id: msg.senderId,
            id: msg.senderId,
            name: msg.senderModel,
          },
          timestamp: msg.sentAt,
          type: msg.type,
          status: msg.deliveryStatus || 'sent',
          isStarred: msg.isStarred || false,
          isKundli: msg.type === 'kundli_details',
          kundliDetails: msg.kundliDetails,
        })) || [];

      // IMPORTANT: keep newest first for inverted FlatList
      // Backend should already return newest-first; do NOT reverse here
      setMessages(formatted);
      console.log('✅ [Astro] Loaded', formatted.length, 'messages');
    } catch (error) {
      console.error('❌ [Astro] Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // ========= SOCKET SETUP =========
  useEffect(() => {
    if (listenersAttached.current) return;

    let mounted = true;

    (async () => {
      try {
        console.log('🔌 [Astro] Connecting socket...');

        const socket = await AstrologerChatSocket.connect();

        if (!socket || !mounted) {
          console.warn(
            '⚠️ [Astro] Socket connection failed or component unmounted',
          );
          return;
        }

        if (!sessionId || !astrologerId) {
          console.warn('⚠️ [Astro] Missing sessionId or astrologerId');
          return;
        }

        console.log('✅ [Astro] Socket connected:', socket.id);
        console.log('📍 [Astro] Joining session:', sessionId);
        AstrologerChatSocket.joinSession(sessionId, astrologerId);
        listenersAttached.current = true;

        // ===== SOCKET EVENT HANDLERS =====

        // Chat message
                // Chat message listener
        AstrologerChatSocket.on('chat_message', (msg) => {
          console.log('📥 [Astro] chat_message received:', msg);

          const msgSessionId = msg.sessionId || msg.threadId;
          if (msgSessionId !== sessionId) return;

          setMessages((prev) => {
            // 1. Check if we already have this EXACT message ID (Real ID)
            if (prev.some((m) => m._id === msg.messageId)) return prev;

            // 2. Check if this is "MY" message coming back from server
            const isMyMessage = msg.senderId === astrologerId;

            // 3. If it's my message, try to find the temporary version we added earlier
            if (isMyMessage) {
              const tempIndex = prev.findIndex(
                (m) =>
                  // Check if ID is a temp ID
                  String(m._id).startsWith('temp-') &&
                  // Check if content matches
                  m.text === (msg.message || msg.content)
              );

              // If we found the temp message, REPLACE it with the real one
              if (tempIndex !== -1) {
                const updatedMessages = [...prev];
                updatedMessages[tempIndex] = {
                  ...updatedMessages[tempIndex], // Keep local props
                  _id: msg.messageId,            // Update to real ID from server
                  timestamp: msg.sentAt || new Date().toISOString(),
                  status: 'sent',                // Update status from 'pending' to 'sent'
                };
                return updatedMessages;
              }
            }

            // 4. If no temp message found (or it's from the user), add it as new
            const newMsg = {
              _id: msg.messageId || `msg-${Date.now()}`,
              text: msg.message || msg.content,
              user: {
                _id: msg.senderId,
                id: msg.senderId,
                name: msg.senderModel,
              },
              timestamp: msg.sentAt || new Date().toISOString(),
              type: msg.type || 'text',
              status: 'received',
              isStarred: false,
              isKundli: msg.type === 'kundli_details',
              kundliDetails: msg.kundliDetails,
            };

            return [newMsg, ...prev];
          });

          // Mark as read logic remains the same...
          setTimeout(() => {
            AstrologerChatSocket.emit('mark_read', {
              messageIds: [msg.messageId],
              sessionId,
              userId: astrologerId,
            });
          }, 1000);
        });


        // Timer events
        AstrologerChatSocket.on('timer_start', (data) => {
          console.log('⏰ [Astro] timer_start:', data);
          if (data.sessionId === sessionId) {
            setIsActive(true);
            setTimeRemaining(data.maxDurationSeconds);
          }
        });

        AstrologerChatSocket.on('timer_tick', (data) => {
          if (data.remainingSeconds !== undefined) {
            setTimeRemaining(data.remainingSeconds);
            if (data.remainingSeconds === 60) {
              setIsTimerWarning(true);
            }
          }
        });

        AstrologerChatSocket.on('timer_warning', () => {
          setIsTimerWarning(true);
          Alert.alert('⏰ Time Warning', '1 minute remaining');
        });

        AstrologerChatSocket.on('timer_ended', () => {
          console.log('🔴 [Astro] Timer ended');
          setIsActive(false);
          setTimeRemaining(0);
          Alert.alert('Session Ended', 'Chat time has ended', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        });

        // Session ended
        AstrologerChatSocket.on('session_ended', () => {
          console.log('🔴 [Astro] session_ended');
          setIsActive(false);
          Alert.alert('Session Ended', 'The chat session has ended', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        });

        // Presence
        AstrologerChatSocket.on('user_joined', (data) => {
          console.log('👤 [Astro] user_joined:', data);
          if (data.role === 'user') setIsUserOnline(true);
        });

        AstrologerChatSocket.on('user_left', (data) => {
          console.log('👤 [Astro] user_left:', data);
          if (data.userId === userId) setIsUserOnline(false);
        });

        AstrologerChatSocket.on('user_status_changed', (data) => {
          if (data.userId === userId) setIsUserOnline(data.isOnline);
        });

        // Typing
        AstrologerChatSocket.on('user_typing', (data) => {
          if (data.userId === userId && data.isTyping) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
        });

        // Star/unstar (real-time)
        AstrologerChatSocket.on('message_starred', (data) => {
          console.log('⭐ [Astro] message_starred:', data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId
                ? { ...msg, isStarred: true }
                : msg,
            ),
          );
        });

        AstrologerChatSocket.on('message_unstarred', (data) => {
          console.log('⭐ [Astro] message_unstarred:', data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId
                ? { ...msg, isStarred: data.isStarred || false }
                : msg,
            ),
          );
        });

        // Read receipts
        AstrologerChatSocket.on('messages_status_updated', (data) => {
          console.log('✅ [Astro] messages_status_updated:', data);
          setMessages((prev) =>
            prev.map((msg) => {
              if (data.messageIds.includes(msg._id)) {
                return {
                  ...msg,
                  status: data.deliveryStatus,
                  readAt: data.readAt,
                };
              }
              return msg;
            }),
          );
        });

        // Deleted
        AstrologerChatSocket.on('message_deleted', (data) => {
          if (data.deleteFor === 'everyone') {
            setMessages((prev) =>
              prev.filter((msg) => msg._id !== data.messageId),
            );
          }
        });

        // Initial messages from API
        await loadMessages();
      } catch (error) {
        console.error('❌ [Astro] Setup error:', error);
        if (mounted) {
          Alert.alert(
            'Connection Error',
            'Failed to connect to chat. Please check your connection.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }],
          );
        }
      }
    })();

    return () => {
      console.log('🧹 [Astro] Cleaning up listeners');
      mounted = false;
      listenersAttached.current = false;

      AstrologerChatSocket.off('chat_message');
      AstrologerChatSocket.off('timer_start');
      AstrologerChatSocket.off('timer_tick');
      AstrologerChatSocket.off('timer_ended');
      AstrologerChatSocket.off('timer_warning');
      AstrologerChatSocket.off('user_joined');
      AstrologerChatSocket.off('user_left');
      AstrologerChatSocket.off('user_status_changed');
      AstrologerChatSocket.off('user_typing');
      AstrologerChatSocket.off('session_ended');
      AstrologerChatSocket.off('message_starred');
      AstrologerChatSocket.off('message_unstarred');
      AstrologerChatSocket.off('messages_status_updated');
      AstrologerChatSocket.off('message_deleted');
    };
  }, [sessionId, astrologerId, userId, loadMessages, navigation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  // App state timer sync
  useEffect(() => {
    const syncTimer = () => {
      if (sessionId && isActive) {
        AstrologerChatSocket.emit('sync_timer', { sessionId });
      }
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncTimer();
      }
    });

    return () => subscription?.remove();
  }, [sessionId, isActive]);

  // ========= SEND MESSAGE (socket + optimistic, no API) =========
  const sendMessage = useCallback(() => {
    if (!sessionId || !orderId || !astrologerId || !userId) {
      console.warn('⚠️ [Astro] Missing required data');
      return;
    }
    if (!input.trim()) {
      console.warn('⚠️ [Astro] Empty message');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const content = input.trim();

    console.log('📤 [Astro] Sending message');

    AstrologerChatSocket.emit('send_message', {
      sessionId,
      orderId,
      senderId: astrologerId,
      senderModel: 'Astrologer',
      receiverId: userId,
      receiverModel: 'User',
      type: 'text',
      content,
      tempId,
    });

    setMessages((prev) => [
      {
        _id: tempId,
        text: content,
        user: {
          _id: astrologerId,
          id: astrologerId,
          name: 'Astrologer',
        },
        timestamp: new Date().toISOString(),
        type: 'text',
        status: 'pending',
        isStarred: false,
      },
      ...prev,
    ]);
    setInput('');
  }, [sessionId, orderId, astrologerId, userId, input]);

  // Typing
  const handleInputChange = (text) => {
    setInput(text);

    AstrologerChatSocket.emit('typing', {
      sessionId,
      userId: astrologerId,
      isTyping: text.length > 0,
    });
  };

  // End chat via API + socket event
  const endChat = useCallback(() => {
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ FIX: Use correct API method name `endChat`
              await ChatService.endChatSession(
                sessionId,
                'astrologer_ended',
              );
              
              // Emit socket event as fallback/confirmation
              AstrologerChatSocket.emit('end_chat', {
                sessionId,
                endedBy: astrologerId,
                reason: 'astrologer_ended',
              });
              
              navigation.goBack();
            } catch (error) {
              console.error('❌ [Astro] End chat error:', error);
              Alert.alert('Error', 'Failed to end chat');
            }
          },
        },
      ],
    );
  }, [sessionId, astrologerId, navigation]);

  // Star/unstar via API + socket
  const toggleStarMessage = async (messageId, star) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isStarred: star } : msg,
      ),
    );

    try {
      // Realtime sync to other client
      AstrologerChatSocket.emit(star ? 'star_message' : 'unstar_message', {
        messageId,
        sessionId,
        userId: astrologerId,
      });

      // Persist via API
      if (star) {
        await ChatService.starMessage(messageId, sessionId);
      } else {
        await ChatService.unstarMessage(messageId, sessionId);
      }
    } catch (error) {
      console.error(`❌ ${star ? 'Star' : 'Unstar'} failed:`, error);
      // Revert UI
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isStarred: !star } : msg,
        ),
      );
    }
  };

  // Delete message (for astrologer only, not everyone)
  const deleteMessage = (messageId) => {
    Alert.alert(
      'Delete Message',
      'Delete this message for yourself?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMessages((prev) =>
              prev.filter((msg) => msg._id !== messageId),
            );
            AstrologerChatSocket.emit('delete_message', {
              messageId,
              sessionId,
              senderId: astrologerId,
              deleteFor: 'sender',
            });
          },
        },
      ],
    );
  };

  // Group messages by date (for inverted FlatList)
  const groupMessagesByDate = (msgs) => {
    const grouped = [];
    let currentDate = null;

    msgs.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();

      if (messageDate !== currentDate) {
        grouped.push({
          _id: `date-${messageDate}`,
          type: 'date-separator',
          date: messageDate,
        });
        currentDate = messageDate;
      }

      grouped.push(message);
    });

    return grouped;
  };

  // Render each row (date separator, kundli card, normal message)
  const renderMessage = ({ item }) => {
    // Date separator
    if (item.type === 'date-separator') {
      const date = new Date(item.date);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let displayDate;
      if (item.date === today) {
        displayDate = 'Today';
      } else if (item.date === yesterday) {
        displayDate = 'Yesterday';
      } else {
        displayDate = date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }

      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{displayDate}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    }

    // Kundli message
    if (item.isKundli && item.kundliDetails) {
      return (
        <View style={styles.kundliCard}>
          <View style={styles.kundliHeader}>
            <Icon name="auto-awesome" size={16} color="#FF6347" />
            <Text style={styles.kundliTitle}>User Kundli Details</Text>
          </View>
          <View style={styles.kundliContent}>
            <View style={styles.kundliRow}>
              <Icon name="person" size={14} color="#8696A0" />
              <Text style={styles.kundliText}>
                Name: {item.kundliDetails.name}
              </Text>
            </View>
            <View style={styles.kundliRow}>
              <Icon name="cake" size={14} color="#8696A0" />
              <Text style={styles.kundliText}>
                DOB: {item.kundliDetails.dob}
              </Text>
            </View>
            <View style={styles.kundliRow}>
              <Icon name="schedule" size={14} color="#8696A0" />
              <Text style={styles.kundliText}>
                Birth Time: {item.kundliDetails.birthTime}
              </Text>
            </View>
            <View style={styles.kundliRow}>
              <Icon name="place" size={14} color="#8696A0" />
              <Text style={styles.kundliText}>
                Place: {item.kundliDetails.birthPlace}
              </Text>
            </View>
            <View style={styles.kundliRow}>
              <Icon name="wc" size={14} color="#8696A0" />
              <Text style={styles.kundliText}>
                Gender: {item.kundliDetails.gender}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Regular message
    const isAstrologer =
      item.user._id === astrologerId || item.user.name === 'Astrologer';

    const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const handleLongPress = () => {
      Alert.alert(
        'Message Options',
        item.text.substring(0, 50) +
          (item.text.length > 50 ? '...' : ''),
        [
          {
            text: '📋 Copy',
            onPress: () => {
              Clipboard.setString(item.text);
              Alert.alert('✅ Copied');
            },
          },
          {
            text: item.isStarred ? '⭐ Unstar' : '⭐ Star',
            onPress: () => toggleStarMessage(item._id, !item.isStarred),
          },
          {
            text: '🗑️ Delete for Me',
            style: 'destructive',
            onPress: () => deleteMessage(item._id),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    };

    return (
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        style={styles.messageContainer}
      >
        <View
          style={[
            styles.messageBubble,
            // ✅ FIX: Astrologer (current user) gets Green bubble on RIGHT
            // User (other person) gets Dark bubble on LEFT
            isAstrologer ? styles.astrologerBubble : styles.userBubble,
          ]}
        >
          {item.isStarred && (
            <View style={styles.starBadge}>
              <Icon name="star" size={10} color="#FFD700" />
            </View>
          )}

          <Text
            style={[
              styles.messageText,
              isAstrologer ? styles.astrologerText : styles.userText,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>{time}</Text>
            {isAstrologer && (
              <Icon
                name={
                  item.status === 'pending'
                    ? 'schedule'
                    : item.status === 'sent'
                    ? 'done'
                    : 'done-all'
                }
                size={14}
                color={
                  item.status === 'read' ? '#4FC3F7' : '#667781'
                }
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Header menu actions (starred/search/filter/call)
  const goToStarredMessages = () => {
    navigation.navigate('AstroStarredMessages', { sessionId });
  };

  const goToSearch = () => {
    navigation.navigate('AstroChatSearch', { sessionId });
  };

  const goToRemediesFilter = () => {
    navigation.navigate('AstroRemediesFilter', { sessionId });
  };

  const goToCall = () => {
    navigation.navigate('AstroCallScreen', { userId, sessionId });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00A884" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              {userProfilePicture ? (
                <Image
                  source={{ uri: userProfilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              {isUserOnline && <View style={styles.onlineDotBadge} />}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {userName || 'User'}
              </Text>
              {timeRemaining !== null ? (
                <Text
                  style={[
                    styles.timerText,
                    isTimerWarning && styles.timerWarning,
                  ]}
                >
                  ⏱️ {formatTime(timeRemaining)}
                </Text>
              ) : isUserOnline ? (
                <Text style={styles.onlineStatus}>Online</Text>
              ) : (
                <Text style={styles.headerSubtitle}>Offline</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* ✅ FIX: Added missing navigation buttons */}
          <TouchableOpacity
            onPress={goToStarredMessages}
            style={styles.headerIconBtn}
          >
            <Icon name="star-border" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToSearch}
            style={styles.headerIconBtn}
          >
            <Icon name="search" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToCall}
            style={styles.headerIconBtn}
          >
            <Icon name="call" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={endChat}
            style={styles.headerIconBtn}
          >
            <Icon name="more-vert" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={groupMessagesByDate(messages)}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="chat-bubble-outline"
              size={64}
              color="#B0B0B0"
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Waiting for user to start...
            </Text>
          </View>
        }
        removeClippedSubviews
        maxToRenderPerBatch={20}
        updateCellsBatchingPeriod={50}
        windowSize={21}
        initialNumToRender={20}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="add" size={26} color="#667781" />
        </TouchableOpacity>

        <TextInput
          value={input}
          onChangeText={handleInputChange}
          placeholder="Message"
          placeholderTextColor="#999"
          style={styles.input}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendBtn,
            input.trim() && styles.sendBtnActive,
          ]}
          disabled={!input.trim()}
        >
          <Icon name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AstroChatRoom;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0C1317',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#1F2C34',
    elevation: 4,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  onlineDotBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#1F2C34',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#E9EDEF',
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#8696A0', 
    marginTop: 2,
  },
  timerText: {
    fontSize: 12,
    color: '#25D366',
    marginTop: 2,
  },
  timerWarning: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#25D366',
    marginTop: 2,
  },
  headerIconBtn: {
    padding: 4,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // Added spacing between buttons
  },

  // Messages
  messagesList: { 
    flex: 1,
    backgroundColor: '#0C1317',
  },
  messagesContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A3942',
  },
  dateSeparatorText: {
    backgroundColor: '#182229',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#8696A0',
  },

  messageContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  messageBubble: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
    minWidth: 80,
  },
  
  astrologerBubble: {
    backgroundColor: '#005C4B',
    alignSelf: 'flex-end', // Current user (astrologer) right
    marginLeft: '20%',
    borderTopRightRadius: 2,
  },
  
  userBubble: {
    backgroundColor: '#1F2C34',
    alignSelf: 'flex-start', // Other user (client) left
    marginRight: '20%',
    borderTopLeftRadius: 2,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  astrologerText: { 
    color: '#E9EDEF',
  },
  
  userText: { 
    color: '#E9EDEF',
  },

  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  
  timestamp: {
    fontSize: 11,
    color: '#8696A0',
  },

  starBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 3,
  },

  // Kundli Card
  kundliCard: {
    backgroundColor: '#1F2C34',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  kundliHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kundliTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6347',
    marginLeft: 6,
  },
  kundliContent: {
    gap: 6,
  },
  kundliRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kundliText: {
    fontSize: 13,
    color: '#E9EDEF',
    marginLeft: 8,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#1F2C34',
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#2A3942',
    borderRadius: 20,
    maxHeight: 100,
    color: '#E9EDEF',
  },
  
  sendBtn: {
    padding: 10,
    marginLeft: 4,
    backgroundColor: '#2A3942',
    borderRadius: 20,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendBtnActive: {
    backgroundColor: '#00A884',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8696A0',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#667781',
    marginTop: 4,
  },

  // Typing
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 20,
    gap: 4,
    backgroundColor: '#0C1317',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8696A0',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8696A0',
  },
});
