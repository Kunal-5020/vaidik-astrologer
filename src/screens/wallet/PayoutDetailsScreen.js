// src/screens/main_screens/PayoutDetailsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';

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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payout) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={56} color="#EF4444" />
          <Text style={styles.errorText}>Payout not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = payoutService.getPayoutStatusColor(payout.status);
  const statusLabel = payoutService.getPayoutStatusLabel(payout.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  amountCard: {
    backgroundColor: '#372643',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  amountLabel: {
    color: '#E0E0E0',
    fontSize: 13,
    marginBottom: 6,
  },
  amountValue: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 12,
    borderRadius: 10,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  bankDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#372643',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 3,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  timelineTitleActive: {
    color: '#111827',
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  rejectionCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  rejectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 3,
  },
  rejectionText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 17,
  },

  notesCard: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#372643',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#372643',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },
});

export default PayoutDetailsScreen;
