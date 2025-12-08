// src/component/OnilneOffilneButton.js

import React, { useState, useCallback, useEffect } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import astrologerService from '../services/api/astrologer.service';

const OnlineOfflineButton = () => {
  const { state } = useAuth();
  
  // ✅ ALL useState FIRST
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Initialize from astrologer data
  useEffect(() => {
    if (state.astrologer?.availability?.isOnline) {
      setIsOnline(state.astrologer.availability.isOnline);
    }
  }, [state.astrologer]);

  // ✅ Toggle online/offline status
  const toggleOnline = useCallback(async () => {
    if (isLoading) return;

    const newStatus = !isOnline;

    try {
      setIsLoading(true);

      console.log('🔄 [OnlineToggle] Toggling status to:', newStatus);

      // ✅ Call API to update status
      const response = await astrologerService.toggleOnlineStatus(newStatus);

      if (response.success) {
        setIsOnline(newStatus);
        console.log('✅ [OnlineToggle] Status updated successfully');
        
        // Optional: Show success feedback
        // Alert.alert(
        //   'Status Updated',
        //   `You are now ${newStatus ? 'Online' : 'Offline'}`
        // );
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ [OnlineToggle] Error:', error);

      // Show error alert
      Alert.alert(
        'Error',
        error.message || 'Failed to update online status. Please try again.'
      );

      // Revert the state on error
      setIsOnline(!newStatus);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, isLoading]);

  return (
    <TouchableOpacity
      style={styles.onlineButton}
      onPress={toggleOnline}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator size="small" color={isOnline ? '#007BFF' : '#808080'} />
        ) : (
          <>
            <Text
              style={[
                styles.onlineText,
                { color: isOnline ? '#10B981' : '#6B7280' },
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
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  onlineButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 90,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  onlineText: {
    fontWeight: '700',
    fontSize: 13,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default OnlineOfflineButton;
