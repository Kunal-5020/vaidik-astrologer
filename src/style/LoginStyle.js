// src/style/LoginStyle.js

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginStyle = StyleSheet.create({
  // ===== CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: '#372643',
  },

  // ===== LOGO CARD =====
  card: {
    width: width * 0.92,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  logo: {
    width: width * 0.65,
    height: 110,
    resizeMode: 'contain',
  },

  vaidik: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2A38',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // ===== PHONE INPUT =====
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    width: width * 0.92,
    backgroundColor: '#fff',
    marginBottom: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 10,
  },

  // ===== BUTTONS =====
  otpButton: {
    backgroundColor: '#FFD700',
    width: width * 0.92,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 54,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  otpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 1,
  },

  truecallerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: width * 0.92,
    justifyContent: 'center',
    marginTop: 12,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  truecallerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#372643',
  },

  truecallerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#372643',
    letterSpacing: 0.3,
  },

  // ===== TERMS & CONDITIONS =====
  termsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 24,
    width: width * 0.92,
  },

  termsText: {
    fontSize: 12,
    color: '#FFD700',
    lineHeight: 18,
  },

  link: {
    color: '#FFD700',
    textDecorationLine: 'underline',
    fontSize: 12,
    fontWeight: '600',
  },

  // ===== DIVIDER =====
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: width * 0.92,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#9ca3af',
  },

  orText: {
    fontSize: 15,
    color: '#e5e7eb',
    marginHorizontal: 12,
    fontWeight: '600',
  },

  // ===== NAVIGATION LINKS =====
  signupWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },

  signupText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },

  signupLink: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  checkStatusButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },

  checkStatusText: {
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // ===== UTILITY STYLES =====
  flagIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },

  countryCode: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default LoginStyle;
