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
import { useNavigation } from '@react-navigation/native';
import { livestreamService } from '../../services';
import Toast from 'react-native-toast-message';
import { requestCameraAndMicPermissions } from '../../utils/permissions';

const GoLiveSetupScreen = () => {
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [streamType, setStreamType] = useState('free');
  const [entryFee, setEntryFee] = useState('');
  
  // Call settings
  const [isCallEnabled, setIsCallEnabled] = useState(true);
  const [voiceCallPrice, setVoiceCallPrice] = useState('50');
  const [videoCallPrice, setVideoCallPrice] = useState('100');
  const [allowPublicCalls, setAllowPublicCalls] = useState(true);
  const [allowPrivateCalls, setAllowPrivateCalls] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleGoLive = async () => {

    // Check permissions first
  const hasPermissions = await requestCameraAndMicPermissions();
  if (!hasPermissions) {
    return;
  }
    // Validation
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title required',
        text2: 'Please enter a stream title',
        position: 'top',
      });
      return;
    }

    if (streamType === 'paid' && (!entryFee || parseFloat(entryFee) <= 0)) {
      Toast.show({
        type: 'error',
        text1: 'Entry fee required',
        text2: 'Please enter a valid entry fee',
        position: 'top',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create stream
      const response = await livestreamService.createStream({
        title: title.trim(),
        description: description.trim(),
        streamType,
        entryFee: streamType === 'paid' ? parseFloat(entryFee) : 0,
      });

      if (response.success) {
        const { streamId, channelName, token, uid, appId } = response.data;

        // Update call settings
        if (isCallEnabled) {
          await livestreamService.updateCallSettings(streamId, {
            isCallEnabled: true,
            voiceCallPrice: parseFloat(voiceCallPrice),
            videoCallPrice: parseFloat(videoCallPrice),
            allowPublicCalls,
            allowPrivateCalls,
          });
        }

        // Navigate to livestream screen
        navigation.replace('Go-Live', {
          streamId,
          channelName,
          token,
          uid,
          appId,
          title,
          callSettings: {
            isCallEnabled,
            voiceCallPrice: parseFloat(voiceCallPrice),
            videoCallPrice: parseFloat(videoCallPrice),
            allowPublicCalls,
            allowPrivateCalls,
          }
        });
      }
    } catch (error) {
      console.error('Go Live Error:', error);
      Alert.alert('Error', error.formattedMessage || 'Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Go Live Setup</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Stream Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stream Details</Text>
        
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="What's your stream about?"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add more details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />

        <Text style={styles.label}>Stream Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, streamType === 'free' && styles.typeBtnActive]}
            onPress={() => setStreamType('free')}
          >
            <Text style={[styles.typeText, streamType === 'free' && styles.typeTextActive]}>
              Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, streamType === 'paid' && styles.typeBtnActive]}
            onPress={() => setStreamType('paid')}
          >
            <Text style={[styles.typeText, streamType === 'paid' && styles.typeTextActive]}>
              Paid
            </Text>
          </TouchableOpacity>
        </View>

        {streamType === 'paid' && (
          <>
            <Text style={styles.label}>Entry Fee (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              value={entryFee}
              onChangeText={setEntryFee}
              keyboardType="numeric"
            />
          </>
        )}
      </View>

      {/* Call Settings */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <Text style={styles.sectionTitle}>Enable Calls</Text>
          <Switch
            value={isCallEnabled}
            onValueChange={setIsCallEnabled}
            trackColor={{ false: '#ccc', true: '#FFB300' }}
            thumbColor={isCallEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {isCallEnabled && (
          <>
            <Text style={styles.label}>Voice Call Price (₹/min)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              value={voiceCallPrice}
              onChangeText={setVoiceCallPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Video Call Price (₹/min)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              value={videoCallPrice}
              onChangeText={setVideoCallPrice}
              keyboardType="numeric"
            />

            <View style={styles.settingRow}>
              <Text style={styles.label}>Allow Public Calls</Text>
              <Switch
                value={allowPublicCalls}
                onValueChange={setAllowPublicCalls}
                trackColor={{ false: '#ccc', true: '#FFB300' }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.label}>Allow Private Calls</Text>
              <Switch
                value={allowPrivateCalls}
                onValueChange={setAllowPrivateCalls}
                trackColor={{ false: '#ccc', true: '#FFB300' }}
              />
            </View>
          </>
        )}
      </View>

      {/* Go Live Button */}
      <TouchableOpacity
        style={[styles.goLiveBtn, isLoading && { opacity: 0.5 }]}
        onPress={handleGoLive}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.goLiveText}>🔴 Go Live Now</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default GoLiveSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelBtn: {
    color: '#6B7280',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: '#FFB300',
    backgroundColor: '#FFF3CD',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeTextActive: {
    color: '#FFB300',
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  goLiveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
