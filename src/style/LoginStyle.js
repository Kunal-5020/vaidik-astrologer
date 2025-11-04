import { StyleSheet } from 'react-native';

const LoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    backgroundColor: '#372643',
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 350,
    height: 180,
    resizeMode: 'contain',
    marginRight: 5,
    marginLeft: 45,
    marginVertical: -55,
  },
  vaidik: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E2A38',
    alignItems: 'center',
    marginLeft: 155,
    marginTop: 12,
  },
  talk: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
    marginLeft: 8,
    marginTop: 1,
  },
  banner: {
    width: '105%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: -45,
  },
  bannerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '90%',
    marginBottom: 15,
    backgroundColor: 'white',
    marginTop: 16,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 8,
    color: 'black',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  otpButton: {
    backgroundColor: '#FFD700',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  otpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  link: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  orText: {
    marginVertical: 10,
    fontSize: 18,
    color: '#f5eeeeff',
  },
  truecallerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '90%',
    justifyContent: 'center',
    marginTop: 15,
  },
  flagIcon: {
    width: 23,
    height: 23,
    marginRight: 10,
    backgroundColor: 'white',
  },

  truecallerIcon: {
    width: 20,
    height: 20,
    marginRight: 25,
    tintColor: '#372643',
  },
  truecallerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  termsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  termsText: {
    fontSize: 12,
    color: '#FFD700',
  },
  card: {
    width: '120%',
    height: 234,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginVertical: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  line: {
    marginTop: 23,
    height: 2,
    width: '45%',
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  line1: {
    marginTop: 23,
    height: 2,
    width: '45%',
    backgroundColor: '#ccc',
    marginLeft: 10,
  },
  INText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipWrapper: {
    alignSelf: 'flex-end', // Align to right of parent
    alignItems: 'center', // Center line under text
    marginTop: 1, // Space from top or other content
    marginRight: 15, // Optional: space from right edge
  },
  skipText: {
    fontSize: 16,
    color: 'grey',
    fontWeight: '400',
    marginTop: -8,
  },
  skipLine: {
    height: 2,
    width: 30,
    backgroundColor: 'grey',
    // marginTop: 1,
    borderRadius: 1,
    fontWeight: '300',
  },
  //   sign-up style ================================
  signupWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160,
  },

  signupText: {
    color: '#fff',
    fontSize: 14,
  },

  signupLink: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
export default LoginStyle;

// =================================================================

// import { StyleSheet } from 'react-native';

// const LoginStyle = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#372643',
//     alignContent: 'center',
//     // justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 40,
//   },
//   logo: {
//     width: 140,
//     height: 140,
//     resizeMode: 'contain',
//     // marginRight: 1,
//     marginLeft: 129,
//     marginVertical: 10,
//   },
//   vaidik: {
//     fontSize: 38,
//     fontWeight: '700',
//     color: '#1E2A38',
//     alignItems: 'center',
//     marginLeft: 10,
//     marginTop: 12,
//   },
//   talk: {
//     fontSize: 38,
//     fontWeight: '400',
//     color: '#000',
//     marginLeft: 8,
//     marginTop: 12,
//   },

//   bannerText: {
//     color: '#000',
//     fontSize: 18,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   phoneContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#d1d5db',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     width: '100%',
//     marginBottom: 15,
//     backgroundColor: 'white',
//     marginTop: 16,
//   },
//   countryCode: {
//     fontSize: 16,
//     marginRight: 8,
//     color: 'black',
//     marginLeft: 10,
//     fontWeight: 'bold',
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 12,
//     fontWeight: 'bold',
//     marginLeft: 15,
//   },
//   otpButton: {
//     backgroundColor: '#FFD700',
//     width: '100%',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   otpText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//   },
//   link: {
//     color: 'white',
//     textDecorationLine: 'underline',
//   },
//   orText: {
//     marginVertical: 10,
//     fontSize: 18,
//     color: '#f5eeeeff',
//   },
//   truecallerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f1f1f1',
//     borderRadius: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     width: '100%',
//     justifyContent: 'center',
//     marginTop: 15,
//   },
//   flagIcon: {
//     width: 23,
//     height: 23,
//     marginRight: 10,
//     backgroundColor: 'white',
//   },

//   truecallerIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//   },
//   truecallerText: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#000',
//   },
//   termsWrapper: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginBottom: 10,
//     paddingHorizontal: 20,
//   },

//   termsText: {
//     fontSize: 12,
//     color: '#FFD700',
//   },
//   card: {
//     width: '120%',
//     height: 43,
//     backgroundColor: '#fff',
//     borderRadius: 4,
//     padding: 16,
//     marginVertical: 25,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     // marginBottom: 20,
//   },
//   line: {
//     marginTop: 23,
//     height: 2,
//     width: '45%',
//     backgroundColor: '#ccc',
//     marginRight: 12,
//   },
//   line1: {
//     marginTop: 23,
//     height: 2,
//     width: '45%',
//     backgroundColor: '#ccc',
//     marginLeft: 10,
//   },
//   INText: {
//     color: 'black',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   skipWrapper: {
//     alignSelf: 'flex-end', // Align to right of parent
//     alignItems: 'center', // Center line under text
//     marginTop: 1, // Space from top or other content
//     marginRight: 15, // Optional: space from right edge
//   },
//   skipText: {
//     fontSize: 16,
//     color: 'grey',
//     fontWeight: '400',
//     marginTop: -8,
//   },
//   skipLine: {
//     height: 2,
//     width: 30,
//     backgroundColor: 'grey',
//     marginTop: 1,
//     borderRadius: 1,
//     fontWeight: '300',
//   },
// });
// export default LoginStyle;
