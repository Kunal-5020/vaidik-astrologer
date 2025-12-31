import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const IncomingChatRequestModal = ({ visible, request, onAccept, onReject }) => {
  if (!visible || !request) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.liveIndicator}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>LIVE REQUEST</Text>
            </View>
            <Text style={styles.timerText}>Expires in 45s</Text>
          </View>

          {/* User Section */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {request.userProfilePic ? (
                <Image source={{ uri: request.userProfilePic }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarInitial}>{request.userName?.charAt(0)}</Text>
              )}
              <View style={styles.onlineBadge} />
            </View>
            <View>
              <Text style={styles.userName}>{request.userName}</Text>
              <Text style={styles.subText}>wants to chat with you</Text>
            </View>
          </View>

          {/* Earnings Card */}
          <View style={styles.earningsCard}>
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Earning Rate</Text>
              <Text style={styles.earningValue}>₹{request.ratePerMinute}/min</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Duration</Text>
              <Text style={styles.earningValue}>5 Mins</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>Accept Chat</Text>
              <Icon name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 5 }} />
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F44336',
    marginRight: 6,
  },
  liveText: {
    color: '#F44336',
    fontSize: 10,
    fontWeight: '800',
  },
  timerText: {
    color: '#666',
    fontSize: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  subText: {
    fontSize: 14,
    color: '#64748B',
  },
  earningsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  earningItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  earningLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  acceptText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default IncomingChatRequestModal;