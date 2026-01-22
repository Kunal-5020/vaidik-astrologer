import { StyleSheet } from 'react-native';

export const COLORS = {
  PRIMARY: '#372643',      // Logo dark purple
  ACCENT: '#FFC107',       // Yellow accent
  BG: '#1A1625',          // Deep purple-tinted background
  BG_GRADIENT: '#2D2438', // Lighter purple for gradients
  DANGER: '#FF453A',      // Keep red for end call
  SURFACE: 'rgba(255, 193, 7, 0.08)', // Yellow-tinted surface
  BORDER: 'rgba(255, 193, 7, 0.2)',   // Yellow border
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  pulseRing1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: COLORS.ACCENT, opacity: 0.2 },
  pulseRing2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: COLORS.ACCENT, opacity: 0.3 },
  avatarRing: { padding: 5, borderRadius: 65, borderWidth: 3, borderColor: COLORS.ACCENT, backgroundColor: COLORS.PRIMARY, elevation: 8 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.BG_GRADIENT, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255, 193, 7, 0.1)' },
  avatarText: { fontSize: 48, color: COLORS.ACCENT, fontWeight: '700' },
  name: { fontSize: 30, color: '#FFF', fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SURFACE, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.BORDER, marginBottom: 40 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.ACCENT, marginRight: 6 },
  status: { color: COLORS.ACCENT, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  timerCard: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 40, paddingVertical: 24, borderRadius: 24, borderWidth: 2, borderColor: COLORS.ACCENT, alignItems: 'center', elevation: 8 },
  bigTimer: { fontSize: 56, fontWeight: '300', color: COLORS.ACCENT, fontVariant: ['tabular-nums'], letterSpacing: 2 },
  subText: { color: 'rgba(255, 193, 7, 0.6)', fontSize: 11, letterSpacing: 2, fontWeight: '600', marginTop: 4 },
  localVideo: { position: 'absolute', top: 100, right: 20, width: 100, height: 140, borderRadius: 16, overflow: 'hidden', borderWidth: 2.5, borderColor: COLORS.ACCENT, backgroundColor: COLORS.PRIMARY, elevation: 6 },
  videoTimerOverlay: { position: 'absolute', top: 100, left: 20, backgroundColor: COLORS.PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.ACCENT, elevation: 4 },
  clockIcon: { marginRight: 6 },
  videoTimerText: { color: COLORS.ACCENT, fontWeight: '700', fontVariant: ['tabular-nums'], fontSize: 15 },
  loadingRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.PRIMARY, borderWidth: 2, borderColor: COLORS.ACCENT, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  waitingText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 20 },
  btn: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.PRIMARY, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.ACCENT, elevation: 4 },
  btnOff: { backgroundColor: COLORS.ACCENT, borderColor: COLORS.PRIMARY },
  endBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.DANGER, justifyContent: 'center', alignItems: 'center', elevation: 10, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.2)' },
});