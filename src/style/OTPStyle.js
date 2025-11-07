import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OTPStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  divider: {
    height: 1,
    backgroundColor: '#ffffff20',
    marginHorizontal: 16,
  },

  // Content Styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    justifyContent: 'flex-start',
  },
  messageText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneNumberHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },

  // OTP Input Styles
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#ffffff40',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: '#ffffff08',
  },
  otpBoxFocused: {
    borderColor: '#FFD700',
    backgroundColor: '#FFD70015',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  otpBoxFilled: {
    borderColor: '#FFD700',
    backgroundColor: '#FFD70020',
  },

  // Button Styles
  verifyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#FFD70050',
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },

  // Resend Styles
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '400',
  },
  timerHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  resendText: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  resendLink: {
    color: '#FFD700',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ffffff20',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },

  // Truecaller Button Styles
  truecallerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  truecallerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

export default OTPStyles;
