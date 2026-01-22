// src/component/CustomToast.js
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const CustomToast = ({ text1 }) => {
  return (
    <View style={styles.toastContainer}>
      <View style={styles.toastBox}>
        <Image
          source={require('../assets/SplashLogo.png')} 
          style={styles.icon}
          resizeMode="contain"
        />
        {/* Force Text to be Black */}
        <Text style={styles.text} numberOfLines={3}>
          {text1}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '100%', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, 
    elevation: 10,
    // Removed paddingTop which was for top positioning
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Explicit White Background
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    // Shadows
    elevation: 6,
    shadowColor: '#000', 
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    
    minWidth: width * 0.4,
    maxWidth: width * 0.9,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: '#000000', // Explicit Black Text
    fontSize: 14,
    fontWeight: '600',
    flex: 1, 
    flexWrap: 'wrap',
    textAlign: 'left',
  },
});

export default CustomToast;