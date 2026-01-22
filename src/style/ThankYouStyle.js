import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const PURPLE = '#5b2b84';
const ORANGE = '#ff9a2e';

export 
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thank: {
    fontSize: Math.min(width * 0.16, 64),
    fontWeight: '800',
    letterSpacing: -2,
    transform: [{ rotate: '-6deg' }],
    color: '#1f2937',
    lineHeight: Math.min(width * 0.18, 72),
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  thankLower: {
    transform: [{ rotate: '6deg' }],
    color: PURPLE,
  },
  card: {
    width: '100%',
    backgroundColor: PURPLE,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -height * 0.01,
    minHeight: height * 0.72,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardInner: {
    flex: 1,
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
    justifyContent: 'space-between',
  },
  messageContainer: {
    marginBottom: height * 0.02,
  },
  cardText: {
    color: '#F5F0FB',
    fontSize: Math.min(width * 0.042, 17),
    lineHeight: Math.min(width * 0.058, 24),
    textAlign: 'center',
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  token: {
    fontWeight: '800',
    color: ORANGE,
    fontSize: Math.min(width * 0.048, 20),
    letterSpacing: 0.5,
  },
  cardTextSpacer: {
    color: '#E9DFF4',
    fontSize: Math.min(width * 0.038, 15),
    lineHeight: Math.min(width * 0.052, 22),
    marginBottom: height * 0.025,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardTextSmall: {
    color: '#D8C9ED',
    fontSize: Math.min(width * 0.034, 14),
    lineHeight: Math.min(width * 0.05, 20),
    textAlign: 'center',
    fontWeight: '400',
  },
  emailText: {
    color: ORANGE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  flexSpacer: {
    flex: 1,
    minHeight: height * 0.02,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dashboardBtn: {
    width: '92%',
    borderRadius: 12,
    backgroundColor: ORANGE,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dashboardText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: Math.min(width * 0.045, 18),
    letterSpacing: 0.5,
  },
  checkStatusBtn: {
    width: '92%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
  },
  checkStatusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Math.min(width * 0.042, 17),
    letterSpacing: 0.3,
  },
  loginBtn: {
    width: '92%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ORANGE,
    paddingVertical: height * 0.018,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Math.min(width * 0.042, 17),
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  backToLoginContainer: {
    paddingVertical: height * 0.018,
    marginTop: height * 0.01,
  },
  backToLoginText: {
    color: '#E9DFF4',
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '600',
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.5,
  },
});