import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BHAGWA = '#ff6d00';
const RED = '#e53935';
const GRAY = '#cccccc';
const DARK_BG = '#7359D1';

const PER_SECOND_RATE = 0.33;

const AudioCallScreen = () => {
  const [seconds, setSeconds] = useState(0);
  const [isMicOn, setMicOn] = useState(true);
  const [isMuted, setMuted] = useState(false);

  const otherUserName = 'Rajesh S';
  const otherUserInitials = 'RS';

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const totalPrice = (seconds * PER_SECOND_RATE).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Top Row */}
      <View style={styles.topRow}>
        <View style={styles.statusRow}>
          {!isMicOn && (
            <View style={[styles.statusChip, { backgroundColor: RED }]}>
                <Icon name='microphone-off' size={22} color='white' />
              <Text style={styles.statusText}>Muted</Text>
            </View>
          )}
        </View>
        <View style={styles.topRightPill}>
          <Text style={styles.topRightPillText}>Audio Call</Text>
        </View>
      </View>

      {/* Timer & Earnings - Fixed Absolute */}
      <View style={styles.topPillContainer}>
        <View style={styles.topPillTimer}>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>
          <Text style={styles.earning}>Earning ₹{totalPrice}</Text>
        </View>
      </View>

      {/* Center content stays fixed */}
      <View style={styles.centerMain}>
        <View style={styles.bigLetterCircle}>
          <Text style={styles.bigLetter}>{otherUserInitials[0]}</Text>
        </View>
        <Text style={styles.userName}>{otherUserName}</Text>
        <Text style={styles.callStatus}>Call Active</Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => setMicOn(m => !m)}
          style={[styles.controlBtnMute, isMicOn && { backgroundColor: 'lightgrey' }]}
        >
          <Icon name={isMicOn ? 'microphone' : 'microphone-off'} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMuted(m => !m)}
          style={[styles.controlBtnMute, isMuted && { backgroundColor: GRAY }]}
        >
          <Icon name={isMuted ? 'volume-off' : 'volume-high'} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            /* hang up */
          }}
          style={[styles.controlBtn, { backgroundColor: RED }]}
        >
          <Icon name="phone-hangup" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50, // fixed height so center content doesn't move
    paddingHorizontal: 20,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusChip: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 ,flexDirection:'row'},
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  topRightPill: {
    backgroundColor: '#ff8a2b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 5,
  },
  topRightPillText: { color: '#fff', fontWeight: '600', fontSize: 12 },

  // Timer + earnings
  topPillContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  topPillTimer: {
    minWidth: 150,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  earning: { color: '#13df7d', fontSize: 18, marginTop: 2 },

  // Center content
  centerMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigLetterCircle: {
    backgroundColor: '#ffd054',
    width: 120,
    height: 120,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLetter: { color: '#721803', fontSize: 49, fontWeight: 'bold' },
  userName: { fontSize: 21, color: '#fff', fontWeight: 'bold', marginTop: 22 },
  callStatus: { color: GRAY, fontSize: 16, marginTop: 4 },

  // Bottom controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '84%',
    marginBottom: 40,
  },
  controlBtn: {
    backgroundColor: GRAY,
    borderRadius: 32,
    padding: 17,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnMute: {
    backgroundColor: BHAGWA,
    borderRadius: 32,
    padding: 17,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioCallScreen;
