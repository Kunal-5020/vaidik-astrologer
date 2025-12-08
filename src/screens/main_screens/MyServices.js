// src/screens/main_screens/MyServices.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerService } from '../../services/api/astrologer.service';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MyServicesScreen = ({ navigation }) => {
  // ✅ ALL HOOKS AT THE TOP
  const { state, updateAstrologer } = useAuth();
  const { astrologer } = state;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingService, setUpdatingService] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [chatRate, setChatRate] = useState('');
  const [callRate, setCallRate] = useState('');
  const [videoCallRate, setVideoCallRate] = useState('');
  const [savingPricing, setSavingPricing] = useState(false);

  const fetchServiceData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await astrologerService.getProfile();

      if (response.success && response.data) {
        setProfileData(response.data);
        
        const pricing = response.data.pricing || {};
        setChatRate(pricing.chat?.toString() || '');
        setCallRate(pricing.call?.toString() || '');
        setVideoCallRate(pricing.videoCall?.toString() || '');
        
        console.log('✅ [MyServices] Profile data loaded');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [MyServices] Error:', error);
      Alert.alert('Error', error.message || 'Failed to load service data');
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServiceData();
    setRefreshing(false);
  }, [fetchServiceData]);

  const toggleService = useCallback(async (serviceKey) => {
    try {
      setUpdatingService(serviceKey);

      const currentProfile = profileData || astrologer;
      let updateData = {};

      switch (serviceKey) {
        case 'chat':
          updateData = { isChatEnabled: !currentProfile.isChatEnabled };
          break;
        case 'call':
          updateData = { isCallEnabled: !currentProfile.isCallEnabled };
          break;
        default:
          setUpdatingService(null);
          return;
      }

      const response = await astrologerService.updateProfile(updateData);

      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          ...updateData,
        }));

        if (updateAstrologer) {
          updateAstrologer(updateData);
        }

        console.log('✅ [MyServices] Service toggled');
      }
    } catch (error) {
      console.error('❌ [MyServices] Error:', error);
      Alert.alert('Error', error.message || 'Failed to update service');
    } finally {
      setUpdatingService(null);
    }
  }, [profileData, astrologer, updateAstrologer]);

  const handleSavePricing = useCallback(async () => {
    try {
      const chat = parseInt(chatRate) || 0;
      const call = parseInt(callRate) || 0;
      const videoCall = parseInt(videoCallRate) || 0;

      if (chat < 10 || call < 10) {
        Alert.alert('Validation Error', 'Rates must be at least ₹10/min');
        return;
      }

      if (chat > 1000 || call > 1000 || videoCall > 1000) {
        Alert.alert('Validation Error', 'Rates cannot exceed ₹1000/min');
        return;
      }

      setSavingPricing(true);

      const response = await astrologerService.updatePricing({
        chat,
        call,
        videoCall,
      });

      if (response.success) {
        Alert.alert('Success', 'Pricing updated successfully');
        setEditingPricing(false);
        
        setProfileData(prev => ({
          ...prev,
          pricing: { chat, call, videoCall },
        }));

        if (updateAstrologer) {
          updateAstrologer({
            pricing: { chat, call, videoCall },
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update pricing');
    } finally {
      setSavingPricing(false);
    }
  }, [chatRate, callRate, videoCallRate, updateAstrologer]);

  useFocusEffect(
    useCallback(() => {
      console.log('📊 [MyServices] Screen focused');
      fetchServiceData();
    }, [fetchServiceData])
  );

  const currentProfile = profileData || astrologer || {};
  const pricing = currentProfile.pricing || {};
  const showPricingWarning = !pricing.chat || !pricing.call;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading && !profileData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#372643']}
              tintColor="#372643"
            />
          }
        >
          {/* Pricing Warning */}
          {showPricingWarning && (
            <View style={styles.warningCard}>
              <Icon name="warning-outline" size={22} color="#F59E0B" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Setup Required</Text>
                <Text style={styles.warningText}>
                  Set your consultation rates to start accepting orders
                </Text>
                <TouchableOpacity
                  style={styles.setupButton}
                  onPress={() => setEditingPricing(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.setupButtonText}>Setup Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Pricing Section */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.sectionTitle}>Consultation Rates</Text>
              {!editingPricing && (
                <TouchableOpacity onPress={() => setEditingPricing(true)}>
                  <Icon name="create-outline" size={20} color="#372643" />
                </TouchableOpacity>
              )}
            </View>

            {editingPricing ? (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Chat Rate (₹/min)</Text>
                  <TextInput
                    style={styles.input}
                    value={chatRate}
                    onChangeText={setChatRate}
                    keyboardType="numeric"
                    placeholder="e.g., 50"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Call Rate (₹/min)</Text>
                  <TextInput
                    style={styles.input}
                    value={callRate}
                    onChangeText={setCallRate}
                    keyboardType="numeric"
                    placeholder="e.g., 100"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Video Call Rate (₹/min)</Text>
                  <TextInput
                    style={styles.input}
                    value={videoCallRate}
                    onChangeText={setVideoCallRate}
                    keyboardType="numeric"
                    placeholder="e.g., 150"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setEditingPricing(false);
                      setChatRate(pricing.chat?.toString() || '');
                      setCallRate(pricing.call?.toString() || '');
                      setVideoCallRate(pricing.videoCall?.toString() || '');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSavePricing}
                    disabled={savingPricing}
                    activeOpacity={0.8}
                  >
                    {savingPricing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.priceDisplay}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Chat</Text>
                  <Text style={styles.priceValue}>₹{pricing.chat || 0}</Text>
                  <Text style={styles.priceUnit}>/min</Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Call</Text>
                  <Text style={styles.priceValue}>₹{pricing.call || 0}</Text>
                  <Text style={styles.priceUnit}>/min</Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Video</Text>
                  <Text style={styles.priceValue}>₹{pricing.videoCall || 0}</Text>
                  <Text style={styles.priceUnit}>/min</Text>
                </View>
              </View>
            )}
          </View>

          {/* Service Availability */}
          <Text style={styles.sectionHeading}>Service Availability</Text>

          {/* Chat Service */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceContent}>
              <View style={styles.serviceLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                  <Icon name="chatbubble-ellipses-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Chat Consultation</Text>
                  <Text style={styles.serviceRate}>₹{pricing.chat || 0}/min</Text>
                </View>
              </View>
              {updatingService === 'chat' ? (
                <ActivityIndicator size="small" color="#372643" />
              ) : (
                <Switch
                  value={!!currentProfile.isChatEnabled}
                  onValueChange={() => toggleService('chat')}
                  trackColor={{ false: '#E5E7EB', true: '#E8EAF6' }}
                  thumbColor={currentProfile.isChatEnabled ? '#372643' : '#9CA3AF'}
                  ios_backgroundColor="#E5E7EB"
                />
              )}
            </View>
          </View>

          {/* Call Service */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceContent}>
              <View style={styles.serviceLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#3B82F615' }]}>
                  <Icon name="call-outline" size={20} color="#3B82F6" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Voice Call</Text>
                  <Text style={styles.serviceRate}>₹{pricing.call || 0}/min</Text>
                </View>
              </View>
              {updatingService === 'call' ? (
                <ActivityIndicator size="small" color="#372643" />
              ) : (
                <Switch
                  value={!!currentProfile.isCallEnabled}
                  onValueChange={() => toggleService('call')}
                  trackColor={{ false: '#E5E7EB', true: '#E8EAF6' }}
                  thumbColor={currentProfile.isCallEnabled ? '#372643' : '#9CA3AF'}
                  ios_backgroundColor="#E5E7EB"
                />
              )}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="information-circle-outline" size={20} color="#372643" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                Enable services you want to offer. Users will be charged per minute based on your rates.
              </Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    padding: Math.min(width * 0.04, 16),
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  // Warning Card
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningContent: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 10,
    lineHeight: 17,
  },
  setupButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  // Pricing Card
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#372643',
  },
  priceUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  // Input
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#372643',
  },
  cancelButtonText: {
    color: '#372643',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#372643',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Service Card
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  serviceRate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },
});

export default MyServicesScreen;
