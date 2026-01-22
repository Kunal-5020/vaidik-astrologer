// src/screens/main_screens/PayoutDetailsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';
import { styles } from '../../style/PayoutDetailsStyle';

const PayoutDetailsScreen = ({ navigation, route }) => {
  const { payoutId } = route.params;
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutDetails();
  }, []);

  const fetchPayoutDetails = async () => {
    try {
      setLoading(true);
      const response = await payoutService.getPayoutDetails(payoutId);
      
      if (response.success) {
        setPayout(response.data);
      }
    } catch (error) {
      console.error('❌ [PayoutDetails] Error:', error);
      Alert.alert('Error', 'Failed to load payout details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!payout) {
    return (
      <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={56} color="#EF4444" />
          <Text style={styles.errorText}>Payout not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColor = payoutService.getPayoutStatusColor(payout.status);
  const statusLabel = payoutService.getPayoutStatusLabel(payout.status);

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Payout Amount</Text>
          <Text style={styles.amountValue}>
            {payoutService.formatAmount(payout.amount)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Icon 
              name={payout.status === 'completed' ? 'check-circle' : 'clock-outline'} 
              size={14} 
              color={statusColor} 
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Payout Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Information</Text>
          
          <InfoRow 
            icon="identifier" 
            label="Payout ID" 
            value={payout.payoutId} 
          />

          <InfoRow 
            icon="calendar" 
            label="Request Date" 
            value={new Date(payout.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })} 
          />

          {payout.processedAt && (
            <InfoRow 
              icon="check-circle-outline" 
              label="Processed Date" 
              value={new Date(payout.processedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })} 
            />
          )}

          {payout.completedAt && (
            <InfoRow 
              icon="check-all" 
              label="Completed Date" 
              value={new Date(payout.completedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })} 
            />
          )}

          {payout.transactionId && (
            <InfoRow 
              icon="receipt" 
              label="Transaction ID" 
              value={payout.transactionId} 
            />
          )}
        </View>

        {/* Bank Details */}
        {payout.bankDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            
            <View style={styles.bankCard}>
              <View style={styles.bankIcon}>
                <Icon name="bank" size={22} color="#372643" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>
                  {payout.bankDetails.bankName || 'Bank Account'}
                </Text>
                <Text style={styles.bankDetail}>
                  {payout.bankDetails.accountHolderName}
                </Text>
                <Text style={styles.bankDetail}>
                  **** **** **** {payout.bankDetails.accountNumber?.slice(-4)}
                </Text>
                <Text style={styles.bankDetail}>
                  IFSC: {payout.bankDetails.ifscCode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          
          <View style={styles.timeline}>
            <TimelineItem
              icon="clipboard-text-outline"
              title="Request Created"
              date={payout.createdAt}
              isCompleted={true}
            />
            
            <TimelineItem
              icon="check-circle-outline"
              title="Approved"
              date={payout.approvedAt}
              isCompleted={payout.status !== 'pending' && payout.status !== 'rejected'}
            />
            
            <TimelineItem
              icon="cog-outline"
              title="Processing"
              date={payout.processedAt}
              isCompleted={payout.status === 'completed'}
            />
            
            <TimelineItem
              icon="check-all"
              title="Completed"
              date={payout.completedAt}
              isCompleted={payout.status === 'completed'}
              isLast={true}
            />
          </View>
        </View>

        {/* Rejection Reason */}
        {payout.status === 'rejected' && payout.rejectionReason && (
          <View style={styles.rejectionCard}>
            <Icon name="alert-circle" size={18} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rejectionTitle}>Rejection Reason</Text>
              <Text style={styles.rejectionText}>{payout.rejectionReason}</Text>
            </View>
          </View>
        )}

        {/* Admin Notes */}
        {payout.adminNotes && (
          <View style={styles.notesCard}>
            <Icon name="note-text-outline" size={18} color="#372643" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.notesTitle}>Admin Notes</Text>
              <Text style={styles.notesText}>{payout.adminNotes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

// Info Row Component
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <Icon name={icon} size={16} color="#666" />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

// Timeline Item Component
const TimelineItem = ({ icon, title, date, isCompleted, isLast }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={[styles.timelineIcon, isCompleted && styles.timelineIconActive]}>
        <Icon 
          name={icon} 
          size={14} 
          color={isCompleted ? '#FFF' : '#999'} 
        />
      </View>
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={[styles.timelineTitle, isCompleted && styles.timelineTitleActive]}>
        {title}
      </Text>
      {date && (
        <Text style={styles.timelineDate}>
          {new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </View>
  </View>
);

export default PayoutDetailsScreen;
