// src/style/OTPStyle.js (UPDATED TO MATCH YOUR THEME)
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OTPStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#372643',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#372643',
  },
  
  // ✅ Header Styles (matching login)
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4a3456',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  
  divider: {
    height: 2,
    backgroundColor: '#FFD700',
    marginHorizontal: 16,
    opacity: 0.3,
  },

  // ✅ Content Styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneNumberHighlight: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 18,
  },

  // ✅ OTP Input Styles (white boxes like login)
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpBox: {
    width: (width - 96) / 6,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  otpBoxFocused: {
    borderColor: '#FFD700',
    borderWidth: 3,
    backgroundColor: '#ffffff',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  otpBoxFilled: {
    borderColor: '#FFD700',
    backgroundColor: '#fffef5',
    borderWidth: 2,
  },

  // ✅ Verify Button (matching login yellow button)
  verifyButtonShadow: {
    position: 'absolute',
    top: 370,
    left: 24,
    right: 24,
    height: 50,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  verifyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: '#d4b86a',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  // ✅ Resend Styles
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#f5eeeeff',
  },
  timerHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  resendText: {
    fontSize: 14,
    color: '#f5eeeeff',
  },
  resendLink: {
    color: '#FFD700',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // ✅ Divider Styles (matching login)
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 18,
    color: '#f5eeeeff',
    fontWeight: '600',
  },

  // ✅ Truecaller Button (matching login style)
  truecallerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  truecallerIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#372643',
  },
  truecallerButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },

  // ✅ Loading Container
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
});

export default OTPStyles;
