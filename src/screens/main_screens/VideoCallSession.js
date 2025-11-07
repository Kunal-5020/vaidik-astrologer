import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BHAGWA = '#ff6d00'; // Orange (bhagwa)
const RED = '#e53935';
const GRAY = '#cccccc';
const LIGHT_BG = '#c1bfff'; // Video on background (purple-ish)
const DARK_BG = '#24264d'; // Video off background

const PER_SECOND_RATE = 0.33; // as per your earnings logic

const VideoCallScreen = () => {
  const [seconds, setSeconds] = useState(0);
  const [isMicOn, setMicOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  const [isMuted, setMuted] = useState(false);

  // Data for other user
  const otherUserName = 'Rajesh S';
  const otherUserInitials = 'RS';
  // const otherUserPhoto = 'URL'; // Optional photo

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(
      2,
      '0',
    )}`;
  const totalPrice = (seconds * PER_SECOND_RATE).toFixed(2);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isVideoOn ? DARK_BG : LIGHT_BG },
      ]}
    >
      {/* Status Chips */}
      <View style={styles.topRow}>
        <View style={styles.statusRow}>
          {!isMicOn && (
            <View style={[styles.statusChip, { backgroundColor: RED }]}>
              <Text style={styles.statusText}>Muted</Text>
            </View>
          )}
          {!isVideoOn && (
            <View
              style={[
                styles.statusChip,
                { backgroundColor: RED, marginLeft: 6 },
              ]}
            >
              <Text style={styles.statusText}>Video Off</Text>
            </View>
          )}
        </View>
        <View style={styles.topRightPill}>
          <Text style={styles.topRightPillText}>Video Call</Text>
        </View>
      </View>
      {/* Timer and Earnings center top */}
      const TopPill = (
      <View style={styles.topPillContainer}>
        <View style={styles.topPillTimer}>
          {/* <Text style={styles.timerText}>{topTimerText}</Text>
        <Text style={styles.earningsText}>Earning ₹{earnings}</Text> */}
          <Text style={styles.timer}>{formatTime(seconds)}</Text>
          <Text style={styles.earning}>Earning ₹{totalPrice}</Text>
        </View>
      </View>
      );
      {/* Middle: user bubble or initials/photo */}
      <View style={styles.centerMain}>
        {isVideoOn ? (
          <>
            <View style={styles.FrameuserBubble}>
              {/* <Text style={styles.userInitials}>{otherUserInitials}</Text> */}
              <Icon name="user-outline" size={68} color="grey" />
            </View>
            <View style={styles.userBubble}>
              {/* <Text style={styles.userInitials}>{otherUserInitials}</Text> */}
              <Icon
                name={isVideoOn ? 'video' : 'video-off'}
                size={68}
                color="grey"
              />
            </View>
            {/* <Text style={styles.userName}>{otherUserName}</Text> */}
            <Text style={styles.callStatus}>Call Active</Text>
          </>
        ) : (
          <>
            {/* Large initial or user photo centered */}
            <View style={styles.bigLetterCircle}>
              <Text style={styles.bigLetter}>{otherUserInitials[0]}</Text>
            </View>
            <Text style={[styles.userName, { marginTop: 22 }]}>
              {otherUserName}
            </Text>
          </>
        )}
      </View>
      {/* Bottom Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => setMicOn(m => !m)}
          style={[
            styles.controlBtnMute,
            isMicOn && { backgroundColor: 'lightgrey' },
          ]}
        >
          <Icon
            name={isMicOn ? 'microphone' : 'microphone-off'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setVideoOn(v => !v)}
          style={[styles.controlBtn, !isVideoOn && { backgroundColor: RED }]}
        >
          <Icon
            name={isVideoOn ? 'video' : 'video-off'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMuted(m => !m)}
          style={[styles.controlBtnMute, isMuted && { backgroundColor: GRAY }]}
        >
          <Icon
            name={isMuted ? 'volume-off' : 'volume-high'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            /* hang up function */
          }}
          style={[styles.controlBtn, { backgroundColor: RED }]}
        >
          <Icon name="phone-hangup" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusChip: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  topButton: { borderRadius: 16, paddingHorizontal: 18, paddingVertical: 6 },
  topBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  centerTop: { alignItems: 'center', marginTop: 16 },
  timer: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  earning: { color: '#13df7d', fontSize: 18, marginTop: 2 },
  centerMain: { alignItems: 'center', marginTop: 30, marginBottom: 60 },
  userBubble: {
    // backgroundColor: '#ffa94d',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  FrameuserBubble: {
    backgroundColor: LIGHT_BG,
    borderWidth: 1,
    borderColor: '#ffa94d',
    borderRadius: 10,
    width: 110,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    left: 130,
    bottom: 120,
  },
  userInitials: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  userName: { marginTop: 8, fontSize: 21, color: '#fff', fontWeight: 'bold' },
  callStatus: { color: GRAY, fontSize: 16, marginTop: 2 },
  bigLetterCircle: {
    backgroundColor: '#ffd054',
    width: 120,
    height: 120,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  bigLetter: { color: '#721803', fontSize: 49, fontWeight: 'bold' },
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
  // Top timer + pill row
  topPillContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  topPillTimer: {
    minWidth: 150,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  earningsText: {
    color: '#3de08a',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 14,
  },
  topRightPill: {
    position: 'absolute',
    right: 14,
    top: -4,
    backgroundColor: '#ff8a2b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 5,
  },
  topRightPillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default VideoCallScreen;
