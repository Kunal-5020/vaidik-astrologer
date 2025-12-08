import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const GiftNotificationModal = ({ visible, gift, onDismiss, onViewInChat }) => {
  if (!visible || !gift) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Gift Image */}
          <Image 
            source={{ uri: gift.giftImage }} 
            style={styles.giftImage}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>🎁 Gift Received!</Text>

          {/* Sender */}
          <Text style={styles.sender}>From: {gift.senderName}</Text>

          {/* Gift Name & Value */}
          <View style={styles.giftInfo}>
            <Text style={styles.giftName}>{gift.giftName}</Text>
            <Text style={styles.giftValue}>₹{gift.giftValue}</Text>
          </View>

          {/* Message */}
          {gift.message && (
            <View style={styles.messageBox}>
              <Icon name="message-text" size={16} color="#666" />
              <Text style={styles.message}>{gift.message}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.dismissBtn]} 
              onPress={onDismiss}
            >
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.viewBtn]} 
              onPress={onViewInChat}
            >
              <Text style={styles.viewBtnText}>View in Chat</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  giftImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sender: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  giftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  giftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  giftValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissBtn: {
    backgroundColor: '#F5F5F5',
  },
  dismissBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  viewBtn: {
    backgroundColor: '#5E60CE',
  },
  viewBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default GiftNotificationModal;
