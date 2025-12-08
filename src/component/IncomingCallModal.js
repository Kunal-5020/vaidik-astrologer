import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const IncomingCallModal = ({ visible, callData, onAccept, onReject }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Pulse animation for call icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, pulseAnim]);

  if (!visible || !callData) return null;

  const isVideo = callData.callType === 'video';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Call Icon */}
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Icon 
              name={isVideo ? 'videocam' : 'phone'} 
              size={50} 
              color="#4CAF50" 
            />
          </Animated.View>

          {/* Caller Name */}
          <Text style={styles.callerName}>
            {callData.userName || 'User'}
          </Text>

          {/* Call Type */}
          <Text style={styles.callType}>
            Incoming {isVideo ? 'Video' : 'Audio'} Call
          </Text>

          {/* Rate */}
          <Text style={styles.rate}>
            ₹{callData.ratePerMinute || '0'}/min
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={onReject}
              activeOpacity={0.7}
            >
              <Icon name="call-end" size={30} color="#FFF" />
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.acceptBtn]} 
              onPress={onAccept}
              activeOpacity={0.7}
            >
              <Icon name="call" size={30} color="#FFF" />
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  callType: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  rate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default IncomingCallModal;
