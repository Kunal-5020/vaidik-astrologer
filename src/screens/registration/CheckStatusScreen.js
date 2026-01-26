import React, { useState, useEffect } from 'react';
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
  LayoutAnimation,
  UIManager,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRegistration } from '../../contexts';
import InterviewTimeline from '../../component/registration/InterviewTimeline';
import { styles } from '../../style/CheckStatusStyle';
import ScreenWrapper from '../../component/ScreenWrapper';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function CheckStatusScreen({ navigation, route }) {
  const { checkStatus } = useRegistration();
  // Auto-fill ticket if passed via navigation
  const [ticketNumber, setTicketNumber] = useState(route.params?.ticketNumber || '');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.ticketNumber) {
      handleCheckStatus(route.params.ticketNumber);
    }
  }, [route.params?.ticketNumber]);

  const handleCheckStatus = async (ticket = ticketNumber) => {
    if (!ticket.trim()) {
      Alert.alert('Validation', 'Please enter your ticket number');
      return;
    }

    try {
      setLoading(true);
      setStatus(null); // Reset UI to trigger animation on new load
      const response = await checkStatus(ticket);
      
      if (response.success && response.data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStatus(response.data);
      } else {
        Alert.alert('Not Found', 'No registration found with this ticket number.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch status';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      return new Date(dateValue).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'waitlist': return '#F59E0B'; // Amber
      case 'shortlisted': return '#3B82F6'; // Blue
      case 'interview_round_1':
      case 'interview_round_2':
      case 'interview_round_3': return '#8B5CF6'; // Violet
      case 'approved': return '#10B981'; // Green
      case 'rejected': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'waitlist': return 'time';
      default: return 'information-circle';
    }
  };

  const registrationData = status?.ticketNumber ? status : status?.registration;
  const isInInterviewStage = registrationData?.status?.includes('interview') || registrationData?.status === 'shortlisted';

  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Application</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* 🎟️ Ticket Input Card */}
            <View style={styles.searchCard}>
              <Text style={styles.label}>ENTER TICKET ID</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="ticket-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="AST-..."
                  placeholderTextColor="#9CA3AF"
                  value={ticketNumber}
                  onChangeText={setTicketNumber}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
              
              <TouchableOpacity
                onPress={() => handleCheckStatus()}
                disabled={loading || !ticketNumber.trim()}
                style={[styles.searchButton, (!ticketNumber.trim() || loading) && styles.disabledButton]}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.searchButtonText}>Track Status</Text>}
              </TouchableOpacity>
            </View>

            {/* 📊 Status Results */}
            {registrationData && (
              <View style={styles.resultContainer}>
                
                {/* Status Header Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(registrationData.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(registrationData.status)} size={20} color={getStatusColor(registrationData.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(registrationData.status) }]}>
                    {registrationData.status.toUpperCase().replace(/_/g, ' ')}
                  </Text>
                </View>

                {/* Details Card */}
                <View style={styles.detailsCard}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Name</Text>
                    <Text style={styles.rowValue}>{registrationData.name}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Applied On</Text>
                    <Text style={styles.rowValue}>{formatDate(registrationData.createdAt)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Phone</Text>
                    <Text style={styles.rowValue}>+{registrationData.countryCode} {registrationData.phoneNumber}</Text>
                  </View>
                </View>

                {/* Waitlist Specifics */}
                {registrationData.status === 'waitlist' && registrationData.waitlist && (
                  <View style={styles.waitlistCard}>
                    <Text style={styles.waitlistHeader}>You are on the waitlist</Text>
                    <View style={styles.waitlistRow}>
                      <View style={styles.waitlistItem}>
                        <Text style={styles.waitlistLabel}>Current Position</Text>
                        <Text style={styles.waitlistValue}>#{registrationData.waitlist.position}</Text>
                      </View>
                      <View style={styles.verticalDivider} />
                      <View style={styles.waitlistItem}>
                        <Text style={styles.waitlistLabel}>Est. Wait</Text>
                        <Text style={styles.waitlistValue}>{registrationData.waitlist.estimatedWaitTime}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Interview Timeline */}
                {isInInterviewStage && (
                  <View style={styles.timelineWrapper}>
                    <Text style={styles.sectionHeader}>Interview Progress</Text>
                    <InterviewTimeline 
                      interviews={registrationData.interviews}
                      currentStatus={registrationData.status}
                    />
                  </View>
                )}

                {/* Success / Approved View */}
                {registrationData.status === 'approved' && (
                  <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>Welcome Aboard! 🌟</Text>
                    <Text style={styles.actionDesc}>
                      Your profile is live. Log in to start your journey as a verified astrologer.
                    </Text>
                    <TouchableOpacity style={styles.primaryActionBtn} onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.primaryActionText}>Login to Dashboard</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Rejected View */}
                {registrationData.status === 'rejected' && (
                  <View style={[styles.actionCard, { borderColor: '#EF4444' }]}>
                    <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Application Declined</Text>
                    <Text style={styles.actionDesc}>
                      {registrationData.rejection?.reason || 'Your application did not meet our current requirements.'}
                    </Text>
                    {registrationData.rejection?.canReapply && (
                      <Text style={styles.reapplyText}>
                        You can reapply after {formatDate(registrationData.rejection.reapplyAfter)}
                      </Text>
                    )}
                  </View>
                )}

              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
}