import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRegistration } from '../../contexts';
import InterviewTimeline from '../../component/registration/InterviewTimeline';
import { styles } from '../../style/CheckStatusStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

export default function CheckStatusScreen({ navigation }) {
  const { checkStatus } = useRegistration();
  const [ticketNumber, setTicketNumber] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async () => {
    if (!ticketNumber.trim()) {
      Alert.alert('Validation', 'Please enter your ticket number');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 Checking status for ticket:', ticketNumber);
      
      const response = await checkStatus(ticketNumber);
      
      console.log('✅ Status Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Check Status Error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch status';
      Alert.alert('Error', errorMessage);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = statusValue => {
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

  const getStatusText = statusValue => {
    switch (statusValue) {
      case 'waitlist':
        return 'In Waitlist';
      case 'shortlisted':
        return 'Shortlisted';
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
        return 'Rejected';
      default:
        return statusValue;
    }
  };

  const registrationData = status?.ticketNumber ? status : status?.registration;

  // ✅ Check if in interview stages
  const isInInterviewStage = registrationData?.status?.includes('interview_round') || 
                              registrationData?.status === 'shortlisted';

  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Check</Text>
        <Text style={styles.titleBold}>Registration Status</Text>
      </View>

      <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text style={styles.label}>Ticket Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ticket number (e.g., AST-1729191672758-ABC123)"
          value={ticketNumber}
          onChangeText={setTicketNumber}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          onPress={handleCheckStatus}
          disabled={loading || !ticketNumber.trim()}
          style={[
            styles.checkButton,
            (loading || !ticketNumber.trim()) && styles.checkButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkButtonText}>Check Status</Text>
          )}
        </TouchableOpacity>

        {registrationData && (
          <>
            {/* Basic Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Registration Details</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(registrationData.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(registrationData.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{registrationData.name || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ticket Number:</Text>
                <Text style={styles.detailValue}>{registrationData.ticketNumber || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{registrationData.phoneNumber || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{registrationData.email || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registered On:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(registrationData.createdAt)}
                </Text>
              </View>
            </View>

            {/* Waitlist Info */}
            {registrationData.waitlist && registrationData.status === 'waitlist' && (
              <View style={styles.waitlistInfo}>
                <Text style={styles.waitlistTitle}>📋 Waitlist Information</Text>
                <Text style={styles.waitlistText}>
                  Position: {registrationData.waitlist.position}
                </Text>
                <Text style={styles.waitlistText}>
                  Estimated Wait: {registrationData.waitlist.estimatedWaitTime}
                </Text>
                {registrationData.waitlist.joinedAt && (
                  <Text style={styles.waitlistText}>
                    Joined: {formatDate(registrationData.waitlist.joinedAt)}
                  </Text>
                )}
              </View>
            )}

            {/* ✅ Interview Timeline - Show if shortlisted or in interview rounds */}
            {isInInterviewStage && registrationData.interviews && (
              <InterviewTimeline 
                interviews={registrationData.interviews}
                currentStatus={registrationData.status}
              />
            )}

            {/* Approval Info */}
            {registrationData.status === 'approved' && (
              <View style={styles.approvalInfo}>
                <Text style={styles.approvalTitle}>🎉 Congratulations!</Text>
                <Text style={styles.approvalText}>
                  Your application has been approved. You can now login to the astrologer app.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Login Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Rejection Info */}
            {registrationData.status === 'rejected' && registrationData.rejection && (
              <View style={styles.rejectionInfo}>
                <Text style={styles.rejectionTitle}>Application Not Approved</Text>
                {registrationData.rejection.reason && (
                  <Text style={styles.rejectionText}>
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
          </>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterPhone')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back to Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backToLoginButton}
        >
          <Text style={styles.backToLoginText}>← Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
