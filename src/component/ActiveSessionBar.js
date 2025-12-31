import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSession } from '../contexts/SessionContext';

const { width } = Dimensions.get('window');

const ActiveSessionBar = () => {
  const { activeSession } = useSession();
  const navigation = useNavigation();

  if (!activeSession) return null;

  const { type, params } = activeSession;
  const isCall = type === 'call';

  const handleReturn = () => {
    if (isCall) {
      navigation.navigate('CallScreen', params);
    } else {
      navigation.navigate('AstroChatRoom', params);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isCall ? styles.callBg : styles.chatBg]} 
      onPress={handleReturn}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.iconBox}>
          {isCall && <View style={styles.pulseDot} />}
          <Icon 
            name={isCall ? 'phone-in-talk' : 'chat-processing'} 
            size={24} 
            color="#FFF" 
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>
            Ongoing {isCall ? 'Call' : 'Chat'}
          </Text>
          <Text style={styles.subLabel}>
            Tap to return to session with {params?.userName || 'User'}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above bottom tab bar
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999,
  },
  callBg: { backgroundColor: '#22C55E' }, // Green for call
  chatBg: { backgroundColor: '#372643' }, // Purple for chat
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF453A',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  info: {
    flex: 1,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
});

export default ActiveSessionBar;