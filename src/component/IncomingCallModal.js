import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// ✅ Generic Component for both Call and Chat Requests
const IncomingCallModal = ({ visible, data, mode = 'call', onAccept, onReject }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rippleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !data) return null;

  const isVideo = data.callType === 'video';
  const isChat = mode === 'chat';

  // ✅ Dynamic Text & Icon based on Mode
  const titleText = isChat ? 'Incoming Chat Request' : `Incoming ${isVideo ? 'Video' : 'Audio'} Call`;
  const acceptIcon = isChat ? 'chatbubble' : (isVideo ? 'videocam' : 'call');
  const acceptColor = '#22C55E'; 

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.overlay} />

        <View style={styles.contentContainer}>
          
          <View style={styles.userInfo}>
            <View style={styles.rippleContainer}>
              <Animated.View
                style={[
                  styles.ripple,
                  {
                    opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                    transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
                  },
                ]}
              />
              <View style={styles.avatarContainer}>
                 {data.userProfilePic ? (
                    <Image source={{ uri: data.userProfilePic }} style={styles.avatar} />
                 ) : (
                    <Text style={styles.avatarText}>{data.userName?.charAt(0)}</Text>
                 )}
              </View>
            </View>

            <Text style={styles.userName}>{data.userName || 'Unknown User'}</Text>
            
            {/* ✅ Dynamic Title */}
            <Text style={styles.incomingText}>{titleText}</Text>
            
            <View style={styles.rateBadge}>
               <Icon name="currency-rupee" size={16} color="#FFD700" />
               <Text style={styles.rateText}>{data.ratePerMinute}/min</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {/* Reject Button */}
            <View style={styles.actionBtnContainer}>
              <TouchableOpacity style={[styles.roundBtn, styles.rejectBtn]} onPress={() => onReject(data.sessionId)}>
                <Icon name="call-end" size={32} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.btnLabel}>Decline</Text>
            </View>

            {/* Accept Button */}
            <View style={styles.actionBtnContainer}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={[styles.roundBtn, { backgroundColor: acceptColor }]} onPress={onAccept}>
                  {isChat ? (
                    <Ionicons name={acceptIcon} size={30} color="#FFF" />
                  ) : (
                    <Icon name={acceptIcon} size={32} color="#FFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.btnLabel}>Accept</Text>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F172A', opacity: 0.95 },
  contentContainer: { width: '100%', height: '100%', justifyContent: 'space-between', paddingVertical: 80, alignItems: 'center' },
  userInfo: { alignItems: 'center', marginTop: 40 },
  rippleContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ripple: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 10, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  userName: { fontSize: 28, fontWeight: '700', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  incomingText: { fontSize: 20, color: '#94A3B8', letterSpacing: 1, marginBottom: 16, fontWeight: '600' },
  rateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FFD700' },
  rateText: { color: '#FFD700', fontWeight: '700', marginLeft: 4, fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginBottom: 40 },
  actionBtnContainer: { alignItems: 'center' },
  roundBtn: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  rejectBtn: { backgroundColor: '#EF4444' },
  btnLabel: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '500' },
});

export default IncomingCallModal;