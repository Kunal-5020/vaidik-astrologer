import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CustomToast = ({ text1 }) => {
  return (
    <View style={styles.toastContainer}>
      <View style={styles.toastBox}>
        <Image
          source={require('../assets/SplashLogo.png')} // your round icon here
          style={styles.icon}
        />
        <Text style={styles.text}>{text1}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '105%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 35,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0.8 },
    shadowRadius: 4,
    width: '60%',
    height: 40,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  text: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomToast;
