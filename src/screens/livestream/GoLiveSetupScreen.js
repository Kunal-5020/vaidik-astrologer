// src/screens/TabsScreen/GoLiveSetupScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { livestreamService } from '../../services';
import Toast from 'react-native-toast-message';
import { requestCameraAndMicPermissions } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';

const GoLiveSetupScreen = () => {
  // ===== STATE =====
  const [isCallEnabled, setIsCallEnabled] = useState(true);
  const [voiceCallPrice, setVoiceCallPrice] = useState('50');
  const [videoCallPrice, setVideoCallPrice] = useState('100');
  const [allowPublicCalls, setAllowPublicCalls] = useState(true);
  const [allowPrivateCalls, setAllowPrivateCalls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);

  // ===== CONTEXT / NAVIGATION =====
  const navigation = useNavigation();
  const { state } = useAuth();
  const astrologer = state?.astrologer;

  // ===== DERIVED =====
  const generatedTitle = astrologer?.name
    ? `${astrologer.name} Live`
    : 'Astrologer Live';

  // ===== EFFECTS =====
  useFocusEffect(
    React.useCallback(() => {
      const setupPermissions = async () => {
        try {
          console.log('📱 [GoLive] Requesting camera & mic permissions...');
          const hasPermissions = await requestCameraAndMicPermissions();

          if (hasPermissions) {
            console.log('✅ [GoLive] Permissions granted');
            setPermissionsReady(true);
          } else {
            console.warn('⚠️ [GoLive] Permissions denied');
            Alert.alert(
              'Permissions Required',
              'Camera and Microphone permissions are required to go live. Please enable them in settings.'
            );
            setPermissionsReady(false);
          }
        } catch (error) {
          console.error('❌ [GoLive] Permission setup error:', error);
          Alert.alert('Error', 'Failed to setup permissions. Please try again.');
          setPermissionsReady(false);
        }
      };

      setupPermissions();
    }, [])
  );

  // ===== HELPERS =====
  const validateCallPricing = () => {
    if (!isCallEnabled) return true;

    const voice = parseInt(voiceCallPrice || '0', 10);
    const video = parseInt(videoCallPrice || '0', 10);

    if (Number.isNaN(voice) || voice <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid voice call price',
        text2: 'Please enter a valid ₹/min rate for voice calls',
        position: 'top',
      });
      return false;
    }

    if (Number.isNaN(video) || video <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid video call price',
        text2: 'Please enter a valid ₹/min rate for video calls',
        position: 'top',
      });
      return false;
    }

    return true;
  };

  const handleGoLive = async () => {
    if (!permissionsReady) {
      Alert.alert(
        'Permissions Required',
        'Camera and Microphone permissions were not granted. Please try again.'
      );
      return;
    }

    if (!validateCallPricing()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await livestreamService.createStream({
        title: generatedTitle,
        description: '',
        streamType: 'free',
        entryFee: 0,
      });

      if (response.success) {
        const { streamId, channelName, token, uid, appId } = response.data;

        if (isCallEnabled) {
          await livestreamService.updateCallSettings(streamId, {
            isCallEnabled: true,
            voiceCallPrice: parseFloat(voiceCallPrice),
            videoCallPrice: parseFloat(videoCallPrice),
            allowPublicCalls,
            allowPrivateCalls,
          });
        }

        navigation.replace('Go-Live', {
          streamId,
          channelName,
          token,
          uid,
          appId,
          title: generatedTitle,
          callSettings: {
            isCallEnabled,
            voiceCallPrice: parseFloat(voiceCallPrice),
            videoCallPrice: parseFloat(videoCallPrice),
            allowPublicCalls,
            allowPrivateCalls,
          },
        });
      } else {
        Alert.alert('Error', 'Failed to start stream. Please try again.');
      }
    } catch (error) {
      console.error('Go Live Error:', error);
      Alert.alert('Error', error.formattedMessage || 'Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Loading Permissions */}
        {!permissionsReady && (
          <View style={styles.permissionLoadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.permissionLoadingText}>
              Setting up camera & microphone...
            </Text>
          </View>
        )}

        {permissionsReady && (
          <>
            {/* Auto Title (read-only) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stream Info</Text>
              <Text style={styles.label}>Title (Auto)</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={generatedTitle}
                editable={false}
              />
              <Text style={styles.helperText}>
                Title is auto-generated from your name. Stream type is set to Free.
              </Text>
            </View>

            {/* Call Settings */}
            <View style={styles.section}>
              <View style={styles.settingRow}>
                <Text style={styles.sectionTitle}>Enable Calls</Text>
                <Switch
                  value={isCallEnabled}
                  onValueChange={setIsCallEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                  thumbColor={isCallEnabled ? '#fff' : '#f4f3f4'}
                  disabled={isLoading}
                />
              </View>

              {isCallEnabled && (
                <>
                  <Text style={styles.label}>Voice Call Price (₹/min)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 50"
                    placeholderTextColor="#9CA3AF"
                    value={voiceCallPrice}
                    onChangeText={setVoiceCallPrice}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />

                  <Text style={styles.label}>Video Call Price (₹/min)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 100"
                    placeholderTextColor="#9CA3AF"
                    value={videoCallPrice}
                    onChangeText={setVideoCallPrice}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />

                  <View style={styles.settingRow}>
                    <Text style={styles.label}>Allow Public Calls</Text>
                    <Switch
                      value={allowPublicCalls}
                      onValueChange={setAllowPublicCalls}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                      thumbColor={allowPublicCalls ? '#fff' : '#f4f3f4'}
                      disabled={isLoading}
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.label}>Allow Private Calls</Text>
                    <Switch
                      value={allowPrivateCalls}
                      onValueChange={setAllowPrivateCalls}
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                      thumbColor={allowPrivateCalls ? '#fff' : '#f4f3f4'}
                      disabled={isLoading}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Go Live Button */}
            <TouchableOpacity
              style={[styles.goLiveBtn, isLoading && { opacity: 0.6 }]}
              onPress={handleGoLive}
              disabled={isLoading || !permissionsReady}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.goLiveText}>🔴 Go Live Now</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoLiveSetupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  permissionLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  permissionLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  disabledInput: {
    opacity: 0.8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  goLiveBtn: {
    backgroundColor: '#EF4444',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  goLiveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
