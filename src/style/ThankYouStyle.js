import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1, // Full height
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0, // Safe padding
    justifyContent: 'space-between', // Distribute vertical space
    paddingBottom: 20,
  },
  iconContainer: {
    marginTop: height * 0.05, // 5% from top
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: {
    width: 80, // Reduced from 100
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    flex: 1, // Takes up remaining space between icon and buttons
    justifyContent: 'center', // Centers ticket vertically in that space
    gap: 20, // Adds space between title, text, and card
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28, // Reduced from 32
    fontWeight: '800',
    color: '#372643',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 20, // Reduced vertical padding
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  ticketValue: {
    fontSize: 26, // Reduced from 28
    fontWeight: '800',
    color: '#372643',
    letterSpacing: 1.5,
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 15, // Reduced margin
  },
  ticketInfo: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  btnContainer: {
    width: '100%',
    gap: 12, // Reduced gap between buttons
    justifyContent: 'flex-end',
  },
  primaryBtn: {
    backgroundColor: '#372643',
    height: 52, // Reduced from 56
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#372643',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    height: 52, // Reduced from 56
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: {
    color: '#372643',
    fontSize: 16,
    fontWeight: '700',
  },
  textBtn: {
    padding: 8,
    alignItems: 'center',
  },
  textBtnText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});