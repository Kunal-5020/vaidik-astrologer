// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import ChatService from '../../services/api/chat/ChatService';
// import chatSocket from '../../services/socket/chatSocket';

// const ChatScreen = ({ route }) => {
//   const { astrologerId } = route.params || {};
//   const [sessionId, setSessionId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const flatListRef = useRef(null);

//   // ✅ INITIATE CHAT SESSION
//   useEffect(() => {
//     const startChat = async () => {
//       try {
//         setLoading(true);

//         const res = await ChatService.initiateChat(astrologerId);
//         const newSessionId = res?.data?.sessionId;

//         if (!newSessionId) {
//           console.error('❌ No sessionId returned from initiateChat');
//           return;
//         }

//         setSessionId(newSessionId);
//         console.log('✅ Joined session:', newSessionId);

//         // Join socket room
//         chatSocket.emit('join_session', { sessionId: newSessionId });

//         // Fetch existing messages
//         const chatData = await ChatService.getSessionMessages(newSessionId);
//         setMessages(chatData?.messages || []);
//       } catch (err) {
//         console.error('Error initiating chat:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     startChat();

//     // Listen for new incoming messages
//     chatSocket.on('new_message', (msg) => {
//       console.log('📩 New message received:', msg);
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       chatSocket.off('new_message');
//     };
//   }, [astrologerId]);

//   // ✅ SEND MESSAGE
//   const handleSend = async () => {
//     if (!sessionId || !message.trim()) return;

//     try {
//       const res = await ChatService.sendMessage(sessionId, message.trim());
//       const newMsg = res?.data;

//       // Add to UI instantly
//       setMessages((prev) => [...prev, newMsg]);
//       setMessage('');

//       // Emit socket event
//       chatSocket.emit('send_message', { sessionId, message: newMsg });
//     } catch (err) {
//       console.error('❌ Error sending message:', err);
//     }
//   };

//   // ✅ EDIT MESSAGE
//   const handleEdit = async (msgId, newText) => {
//     try {
//       const res = await ChatService.editMessage(msgId, newText);
//       const updated = res?.data;
//       setMessages((prev) =>
//         prev.map((m) => (m.id === msgId ? { ...m, ...updated } : m))
//       );
//     } catch (err) {
//       console.error('❌ Error editing message:', err);
//     }
//   };

//   if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item, index) => item.id || index.toString()}
//         renderItem={({ item }) => (
//           <View
//             style={[
//               styles.msgBubble,
//               item.type === 'sent' ? styles.sent : styles.received,
//             ]}
//           >
//             <Text style={styles.msgText}>{item.content}</Text>
//           </View>
//         )}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={80}
//       >
//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={message}
//             onChangeText={setMessage}
//           />
//           <TouchableOpacity onPress={handleSend}>
//             <Icon name="send" size={28} color="#007AFF" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   msgBubble: {
//     marginVertical: 4,
//     marginHorizontal: 10,
//     padding: 10,
//     borderRadius: 12,
//     maxWidth: '75%',
//   },
//   sent: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#DCF8C6',
//   },
//   received: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#E5E5EA',
//   },
//   msgText: { fontSize: 16, color: '#000' },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     marginRight: 10,
//   },
// });

// export default ChatScreen;


import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import chatSocket from '../../services/socket/chatSocket';
import ChatService from '../../services/api/chat/ChatService';

const ASTROLOGER_ID = '68f55913fcac5b00b4225a8e'; // Real astrologer id from auth
const ChatScreen = () => {
  const [chatRequests, setChatRequests] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Connect socket and join astrologer room
    chatSocket.connect(ASTROLOGER_ID);

    // Listen for incoming chat requests
    chatSocket.on('chat_request', (data) => {
      setChatRequests((prev) => [...prev, data]);
      Alert.alert(
        'New Chat Request',
        `User ${data.userId} wants to chat.`,
        [{ text: 'OK' }],
      );
    });

    // Listen for messages in active session
    chatSocket.on('chat_message', (msg) => {
      if (currentSession && msg.threadId === currentSession.sessionId) {
        setMessages((prev) => [
          { _id: Date.now(), text: msg.message, user: { _id: msg.senderId === ASTROLOGER_ID ? 'consultant' : 'user' } },
          ...prev,
        ]);
      }
    });

    // Cleanup on unmount
    return () => {
      chatSocket.off('chat_request');
      chatSocket.off('chat_message');
      chatSocket.disconnect();
    };
  }, [currentSession]);

  // Accept a chat
  const acceptChat = async (request) => {
    try {
      const response = await ChatService.acceptChat(request.threadId, ASTROLOGER_ID);
      if (response.success) {
        setCurrentSession(response.data);
        setChatRequests([]); // Clear pending requests

        chatSocket.emit('chat_accepted', { threadId: request.threadId, astrologerId: ASTROLOGER_ID });
        loadMessages(response.data.sessionId);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Reject a chat
  const rejectChat = async (request) => {
    try {
      const response = await ChatService.rejectChat(request.threadId, ASTROLOGER_ID);
      if (response.success) {
        setChatRequests((prev) => prev.filter(r => r.threadId !== request.threadId));
        chatSocket.emit('chat_rejected', { threadId: request.threadId, astrologerId: ASTROLOGER_ID });
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Load messages from API
  const loadMessages = async (sessionId) => {
    try {
      const data = await ChatService.getSessionMessages(sessionId);
      const formatted = data.messages.map(msg => ({
        _id: msg.messageId,
        text: msg.content,
        user: { _id: msg.senderId === ASTROLOGER_ID ? 'consultant' : 'user' },
      }));
      setMessages(formatted.reverse());
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!currentSession) return;
    if (input.trim() === '') return;

    chatSocket.emit('send_message', {
      threadId: currentSession.sessionId,
      senderId: ASTROLOGER_ID,
      message: input.trim(),
    });

    setMessages((prev) => [
      { _id: Date.now(), text: input.trim(), user: { _id: 'consultant' } },
      ...prev,
    ]);

    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {chatRequests.length > 0 && (
        <View style={styles.requestsContainer}>
          <Text style={styles.requestsTitle}>Chat Requests:</Text>
          {chatRequests.map((req) => (
            <View key={req.threadId} style={styles.requestItem}>
              <Text>User ID: {req.userId}</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptChat(req)}>
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectChat(req)}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {currentSession ? (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.user._id === 'consultant' ? styles.consultantBubble : styles.userBubble]}>
                <Text>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={{ padding: 12 }}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80} style={styles.inputContainer}>
            <TextInput value={input} onChangeText={setInput} placeholder="Type message" style={styles.input} />
            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
              <Icon name="send" size={24} color="#007AFF" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.noChat}>
          <Text>No active chat session. Accept a request to start chatting.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#fff' },
  requestsContainer: { padding: 12, backgroundColor: '#f9f9f9' },
  requestsTitle: { fontWeight: 'bold', marginBottom: 8 },
  requestItem: { marginBottom: 10, backgroundColor: '#e2e2e2', padding: 10, borderRadius: 6 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  acceptBtn: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 6 },
  rejectBtn: { backgroundColor: '#f44336', padding: 10, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  messageBubble: { borderRadius: 15, padding: 10, marginVertical: 6, maxWidth: '75%' },
  consultantBubble: { backgroundColor: '#DCF8C6', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderRadius: 20, backgroundColor: '#f1f1f1', paddingHorizontal: 12, height: 40 },
  sendBtn: { marginLeft: 10 },
  noChat: { flex: 1, justifyContent: 'center', alignItems: 'center' },
};

export default ChatScreen;

