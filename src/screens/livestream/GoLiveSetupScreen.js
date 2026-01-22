import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { livestreamService } from '../../services/api/livestream.service'; // Check your import path
import { requestCameraAndMicPermissions } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from '../../style/GoLiveSetupStyle';

const GoLiveSetupScreen = () => {
  // ===== STATE =====
  const [isCallEnabled, setIsCallEnabled] = useState(true);
  const [voiceCallPrice, setVoiceCallPrice] = useState('50');
  const [videoCallPrice, setVideoCallPrice] = useState('100');
  
  // ✅ Added Public/Private Toggles
  const [allowPublicCalls, setAllowPublicCalls] = useState(true);
  const [allowPrivateCalls, setAllowPrivateCalls] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);

  const navigation = useNavigation();
  const { astrologer } = useAuth(); // Assuming user object from context
  
  // Auto-generated title logic handled by backend now, but we show preview
  const generatedTitle = astrologer?.name ? `${astrologer.name}'s Stream` : 'Live Stream';

  // ===== PERMISSIONS =====
  useFocusEffect(
    React.useCallback(() => {
      const setupPermissions = async () => {
        const hasPermissions = await requestCameraAndMicPermissions();
        setPermissionsReady(hasPermissions);
        if (!hasPermissions) {
          Alert.alert('Permission Error', 'Camera and Mic permissions are required.');
        }
      };
      setupPermissions();
    }, [])
  );

  // ===== ACTIONS =====
  const handleGoLive = async () => {
    if (!permissionsReady) return Alert.alert('Error', 'Permissions not granted');

    // Basic Validation
    if (isCallEnabled) {
      if (!allowPublicCalls && !allowPrivateCalls) {
        return Alert.alert('Setup Error', 'You must enable at least Public or Private calls.');
      }
    }

    try {
      setIsLoading(true);

      // ✅ 1. SINGLE API CALL TO GO LIVE
      const response = await livestreamService.goLive({
        voiceCallPrice: isCallEnabled ? parseFloat(voiceCallPrice) : 0,
        videoCallPrice: isCallEnabled ? parseFloat(videoCallPrice) : 0,
        allowPublicCalls,
        allowPrivateCalls,
        maxCallDuration: 600, // 10 mins default
      });

      if (response.success) {
        const { streamId, channelName, token, uid, appId, title } = response.data;

        // ✅ 2. NAVIGATE IMMEDIATELY
        navigation.replace('Go-Live', {
          streamId,
          channelName,
          token,
          uid,
          appId,
          title: title || generatedTitle,
          callSettings: {
            isCallEnabled,
            voiceCallPrice: parseFloat(voiceCallPrice),
            videoCallPrice: parseFloat(videoCallPrice),
            allowPublicCalls,
            allowPrivateCalls,
          },
        });
      }
    } catch (error) {
      console.error('Go Live Error:', error);
      Alert.alert('Error', error.formattedMessage || 'Failed to go live');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false}>
      <ScrollView style={styles.container}>
        
        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stream Setup</Text>
          <Text style={styles.label}>Title (Auto-Generated)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={generatedTitle}
            editable={false}
          />
        </View>

        {/* Call Settings Section */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.sectionTitle}>Paid Calls</Text>
            <Switch
              value={isCallEnabled}
              onValueChange={setIsCallEnabled}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            />
          </View>

          {isCallEnabled && (
            <>
              {/* Pricing Inputs */}
              <Text style={styles.label}>Voice Call Price (₹/min)</Text>
              <TextInput
                style={styles.input}
                value={voiceCallPrice}
                onChangeText={setVoiceCallPrice}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Video Call Price (₹/min)</Text>
              <TextInput
                style={styles.input}
                value={videoCallPrice}
                onChangeText={setVideoCallPrice}
                keyboardType="numeric"
              />
              
              <View style={styles.divider} />

              {/* ✅ Public/Private Toggles */}
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Allow Public Calls</Text>
                  <Text style={styles.toggleSub}>Everyone can see/hear</Text>
                </View>
                <Switch
                  value={allowPublicCalls}
                  onValueChange={setAllowPublicCalls}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Allow Private Calls</Text>
                  <Text style={styles.toggleSub}>Only you and caller (Hidden audio/video)</Text>
                </View>
                <Switch
                  value={allowPrivateCalls}
                  onValueChange={setAllowPrivateCalls}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                />
              </View>
            </>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.goLiveBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleGoLive}
          disabled={isLoading || !permissionsReady}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.goLiveText}>🔴 Go Live Now</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
};

export default GoLiveSetupScreen;
