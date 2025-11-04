import React, { useState } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';

const OnlineButtonButton = () => {
  const [isOnline, setIsOnline] = useState(true);

  const toggleOnline = () => setIsOnline(!isOnline);

  return (
    <TouchableOpacity
      style={styles.onlineButton} // background constant
      onPress={toggleOnline}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Text
          style={[
            styles.onlineText,
            { color: isOnline ? '#007BFF' : '#808080' },
          ]}
        >
          {isOnline ? 'Online' : 'Offline'}
        </Text>
        <Image
          source={
            isOnline
              ? require('../assets/on-button.png')
              : require('../assets/off-button.png')
          }
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  onlineButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E0E0E0', // constant background color
    width: '50%',
    height: 33,
    left: 40,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6, // spacing between icon and text
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    left: 10,
  },
});

export default OnlineButtonButton;
