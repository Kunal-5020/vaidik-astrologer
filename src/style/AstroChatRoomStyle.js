import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
  PRIMARY: '#372643',
  SECONDARY: '#4A3456',
  ACCENT: '#FFC107',
  BG: '#F0F4F8',
  BG_CHAT: '#E8EFF5',
  BUBBLE_ASTRO: '#E0D4F0',
  BUBBLE_USER: '#FFFFFF',
  TEXT_DARK: '#1F2937',
  TEXT_LIGHT: '#6B7280',
  BORDER: '#D1D5DB',
  SUCCESS: '#10B981',
  DANGER: '#FF453A',
  WARNING: '#F59E0B',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.TEXT_LIGHT, fontWeight: '500' },

  // --- HEADER ---
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 10, 
    backgroundColor: COLORS.PRIMARY, 
    ...Platform.select({ 
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, 
      android: { elevation: 4 } 
    }) 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { padding: 4, marginRight: 8 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  onlineDot: { position: 'absolute', bottom: 0, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.SUCCESS, borderWidth: 2, borderColor: COLORS.PRIMARY },
  headerInfo: { flex: 1 },
  headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  
  // --- HEADER ACTIONS ---
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.25)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 193, 7, 0.3)' 
  },
  timerPillWarning: { backgroundColor: 'rgba(255, 69, 58, 0.2)', borderColor: 'rgba(255, 69, 58, 0.5)' },
  timerTxt: { color: COLORS.ACCENT, fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] },
  timerTxtWarning: { color: COLORS.DANGER },
  
  // Restored Buttons
  suggestBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: COLORS.WARNING, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  endBtn: { 
    backgroundColor: COLORS.DANGER, 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  endBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  menuBtn: { marginLeft: 4 }, // Added missing style for 3-dots

  // --- KUNDLI ---
  kundliHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  kundliHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kundliHeaderText: { fontSize: 15, fontWeight: '700', color: COLORS.PRIMARY },
  kundliInfoCard: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  kundliInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  kundliInfoLabel: { fontSize: 13, fontWeight: '600', color: COLORS.TEXT_LIGHT, width: 100 },
  kundliInfoValue: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.TEXT_DARK },

  // --- CHAT LIST ---
  chatBackground: { flex: 1, backgroundColor: COLORS.BG_CHAT },
  listContent: { paddingHorizontal: 10, paddingVertical: 20 },

  dateSeparator: { alignItems: 'center', marginVertical: 12 },
  datePill: { backgroundColor: 'rgba(55, 38, 67, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(55, 38, 67, 0.2)' },
  dateSeparatorText: { fontSize: 11, color: COLORS.PRIMARY, fontWeight: '600', letterSpacing: 0.5 },

  messageRow: { marginVertical: 4, flexDirection: 'row', width: '100%' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 8, position: 'relative', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 }, android: { elevation: 2 } }) },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: COLORS.BUBBLE_ASTRO },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: COLORS.BUBBLE_USER },

  audioWrapper: { marginBottom: 6, paddingVertical: 4 },
  messageText: { fontSize: 15, color: COLORS.TEXT_DARK },
  metaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  timeText: { fontSize: 10, color: COLORS.TEXT_LIGHT },

  imageContainer: { marginBottom: 6, borderRadius: 12, overflow: 'hidden' },
  mediaImage: { width: 200, height: 200, borderRadius: 12, backgroundColor: '#E5E7EB' },
  videoContainer: { marginBottom: 6, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  videoThumbnail: { width: 200, height: 200, borderRadius: 12, backgroundColor: '#000' },
  videoPlayOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(55, 38, 67, 0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.ACCENT },
  videoDurationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  videoDurationText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

  kundliCard: { alignSelf: 'center', width: '100%', backgroundColor: 'rgba(55, 38, 67, 0.1)', borderRadius: 8, padding: 10, marginVertical: 4, borderLeftWidth: 4, borderLeftColor: COLORS.PRIMARY },
  kundliTitle: { fontWeight: 'bold', color: COLORS.PRIMARY, marginBottom: 4 },
  kundliText: { color: COLORS.TEXT_DARK, fontSize: 13 },

  leftTail: { position: 'absolute', top: 0, left: -6, width: 0, height: 0, borderTopWidth: 8, borderTopColor: COLORS.BUBBLE_USER, borderLeftWidth: 8, borderLeftColor: 'transparent' },
  rightTail: { position: 'absolute', top: 0, right: -6, width: 0, height: 0, borderTopWidth: 8, borderTopColor: COLORS.BUBBLE_ASTRO, borderRightWidth: 8, borderRightColor: 'transparent' },

  // --- INPUT & FOOTER ---
  inputWrapper: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: COLORS.BORDER }, // Added wrapper for better KeyboardAvoiding
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 12, 
    paddingTop: 10, 
    paddingBottom: Platform.OS === 'ios' ? 10 : 12, 
    backgroundColor: '#FFF'
  },
  input: { 
    flex: 1, 
    backgroundColor: COLORS.BG, 
    color: COLORS.TEXT_DARK, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    paddingTop: 10, 
    marginRight: 10, 
    fontSize: 15, 
    maxHeight: 100, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER 
  },
  sendButton: { 
    backgroundColor: COLORS.PRIMARY, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 2, 
    ...Platform.select({ 
      ios: { shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }, 
      android: { elevation: 4 } 
    }) 
  },
  sendButtonDisabled: { backgroundColor: COLORS.TEXT_LIGHT, opacity: 0.5 },
  waitingText: { 
    textAlign: 'center', 
    color: COLORS.TEXT_LIGHT, 
    fontSize: 12, 
    paddingVertical: 8, 
    backgroundColor: 'rgba(255, 193, 7, 0.1)', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255, 193, 7, 0.3)' 
  },
  footerBanner: { padding: 15, backgroundColor: COLORS.PRIMARY, alignItems: 'center' },
});