import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming you have this installed

const { width } = Dimensions.get('window');

const IncomingChatRequestModal = ({ visible, request, onAccept, onReject }) => {
  if (!visible || !request) return null;

  const {
    userName = 'User',
    userProfilePic,
    ratePerMinute = 0,
    userQuestion, // If passed
  } = request;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* --- HEADER: User Info --- */}
          <View style={styles.avatarContainer}>
            {userProfilePic ? (
              <Image source={{ uri: userProfilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.onlineBadge} />
          </View>

          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          
          <Text style={styles.incomingText}>Incoming Chat Request...</Text>

          {/* --- DETAILS: Rate & Earnings --- */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon name="currency-rupee" size={16} color="#333" />
              <Text style={styles.detailText}>{ratePerMinute}/min</Text>
              <Text style={styles.detailLabel}>Rate</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Icon name="schedule" size={16} color="#333" />
              <Text style={styles.detailText}>5 mins</Text>
              <Text style={styles.detailLabel}>Min Duration</Text>
            </View>
          </View>

          {/* --- OPTIONAL: Question Preview --- */}
          {userQuestion && (
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Question:</Text>
              <Text style={styles.questionText} numberOfLines={2}>
                {userQuestion}
              </Text>
            </View>
          )}

          {/* --- ACTIONS --- */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={onReject}
              activeOpacity={0.8}
            >
              <Icon name="close" size={24} color="#FFF" />
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.acceptBtn]} 
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                 <Icon name="chat" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.acceptText}>Accept Chat</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker dim for better focus
    justifyContent: 'flex-end', // Slide up from bottom looks more modern
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Avatar
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD700', // Gold border
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE87A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Texts
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  incomingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    // Using a simple pulse animation logic here requires Reanimated, 
    // keeping it simple for now.
  },

  // Details Row
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#DDD',
    height: '80%',
    alignSelf: 'center',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
  },

  // Question Box
  questionBox: {
    width: '100%',
    backgroundColor: '#FFF9C4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 2,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 15,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rejectBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  btnText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  
  acceptBtn: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default IncomingChatRequestModal;