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
import { livestreamService } from '../../services/api/livestream.service'; // Check your import path
import { requestCameraAndMicPermissions } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
    </SafeAreaView>
  );
};

export default GoLiveSetupScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  container: { padding: 16 },
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111' },
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, color: '#111' },
  disabledInput: { color: '#999', backgroundColor: '#F3F4F6' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  
  toggleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginVertical: 8 
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  toggleSub: { fontSize: 11, color: '#999', marginTop: 2 },

  goLiveBtn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  goLiveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});