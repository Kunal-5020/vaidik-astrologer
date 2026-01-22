// src/screens/main_screens/MyServices.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerService } from '../../services/api/astrologer.service';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../../style/MyServicesStyle';

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
    // ✅ FIX: safeAreaTop={false} + avoidKeyboard={true}
    <ScreenWrapper 
      backgroundColor="#ffffff" 
      barStyle="light-content" 
      safeAreaTop={false}
      avoidKeyboard={true}
    >
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
    </ScreenWrapper>
  );
};

export default MyServicesScreen;