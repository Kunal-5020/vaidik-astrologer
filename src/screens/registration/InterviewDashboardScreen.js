import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRegistration } from '../../contexts';
import InterviewTimeline from '../../component/registration/InterviewTimeline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../style/InterviewDashboardStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

export default function InterviewDashboardScreen({ navigation }) {
  const { checkStatus } = useRegistration();
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRegistrationStatus();
  }, []);

  const loadRegistrationStatus = async () => {
    try {
      setLoading(true);
      
      // Get ticket number from storage
      const ticketNumber = await AsyncStorage.getItem('@vaidik_ticket_number');
      
      if (!ticketNumber) {
        // No ticket found, redirect to registration
        navigation.replace('RegisterPhone');
        return;
      }

      console.log('📱 Loading status for ticket:', ticketNumber);
      
      const response = await checkStatus(ticketNumber);
      
      if (response.success && response.data) {
        const data = response.data.ticketNumber ? response.data : response.data.registration;
        setRegistrationData(data);
        
        // Check if approved - redirect to home
        if (data.status === 'approved') {
          Alert.alert(
            'Congratulations! 🎉',
            'Your application has been approved. Redirecting to login...',
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('Login'),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('❌ Error loading status:', error);
      Alert.alert('Error', 'Failed to load your status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRegistrationStatus();
    setRefreshing(false);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'waitlist':
        return '#ff9a2e';
      case 'shortlisted':
        return '#2196f3';
      case 'interview_round_1':
      case 'interview_round_2':
      case 'interview_round_3':
      case 'interview_round_4':
        return '#9c27b0';
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      default:
        return '#5b2b84';
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'waitlist':
        return 'In Waitlist';
      case 'shortlisted':
        return 'Shortlisted for Interviews';
      case 'interview_round_1':
        return 'Interview Round 1';
      case 'interview_round_2':
        return 'Interview Round 2';
      case 'interview_round_3':
        return 'Interview Round 3';
      case 'interview_round_4':
        return 'Interview Round 4';
      case 'approved':
        return 'Approved ✓';
      case 'rejected':
        return 'Not Approved';
      default:
        return statusValue;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@vaidik_ticket_number');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const isInInterviewStage = registrationData?.status?.includes('interview_round') || 
                              registrationData?.status === 'shortlisted';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5b2b84" />
        <Text style={styles.loadingText}>Loading your status...</Text>
      </View>
    );
  }

  if (!registrationData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load registration data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRegistrationStatus}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welcome Back!</Text>
          <Text style={styles.headerName}>{registrationData.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5b2b84']} />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(registrationData.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusText(registrationData.status)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ticket Number:</Text>
            <Text style={styles.infoValue}>{registrationData.ticketNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered On:</Text>
            <Text style={styles.infoValue}>{formatDate(registrationData.createdAt)}</Text>
          </View>
        </View>

        {/* Waitlist Info */}
        {registrationData.status === 'waitlist' && registrationData.waitlist && (
          <View style={styles.waitlistCard}>
            <Text style={styles.cardTitle}>📋 Waitlist Information</Text>
            <View style={styles.waitlistInfo}>
              <View style={styles.waitlistItem}>
                <Text style={styles.waitlistLabel}>Your Position:</Text>
                <Text style={styles.waitlistValue}>{registrationData.waitlist.position}</Text>
              </View>
              <View style={styles.waitlistItem}>
                <Text style={styles.waitlistLabel}>Estimated Wait:</Text>
                <Text style={styles.waitlistValue}>{registrationData.waitlist.estimatedWaitTime}</Text>
              </View>
            </View>
            <Text style={styles.waitlistNote}>
              💡 We will notify you when your application is shortlisted for interviews.
            </Text>
          </View>
        )}

        {/* Interview Timeline */}
        {isInInterviewStage && registrationData.interviews && (
          <InterviewTimeline 
            interviews={registrationData.interviews}
            currentStatus={registrationData.status}
          />
        )}

        {/* Rejection Info */}
        {registrationData.status === 'rejected' && registrationData.rejection && (
          <View style={styles.rejectionCard}>
            <Text style={styles.rejectionTitle}>❌ Application Not Approved</Text>
            {registrationData.rejection.reason && (
              <Text style={styles.rejectionReason}>
                Reason: {registrationData.rejection.reason}
              </Text>
            )}
            {registrationData.rejection.canReapply && (
              <Text style={styles.reapplyText}>
                You can reapply after: {formatDate(registrationData.rejection.reapplyAfter)}
              </Text>
            )}
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            For any queries regarding your application, please email us at:
          </Text>
          <Text style={styles.helpEmail}>contact@vaidiktalk.com</Text>
        </View>
      </ScrollView>
    </View>
    </ScreenWrapper>
  );
}
