// src/screens/main_screens/WalletWithdrawScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';

const WalletWithdrawScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsResponse, bankResponse] = await Promise.all([
        payoutService.getPayoutStats(),
        payoutService.getBankAccounts(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
        setBalance(statsResponse.data.withdrawableAmount || 0);
      }

      if (bankResponse.success && bankResponse.data.accounts.length > 0) {
        setBankAccounts(bankResponse.data.accounts);
        setSelectedBank(bankResponse.data.accounts[0]);
      }
    } catch (error) {
      console.error('❌ [Withdraw] Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > balance) {
      Alert.alert('Insufficient Funds', 'You cannot withdraw more than your available balance.');
      return;
    }

    if (withdrawAmount < 500) {
      Alert.alert('Minimum Limit', 'Minimum withdrawal amount is ₹500.');
      return;
    }

    if (!selectedBank) {
      Alert.alert('No Bank Account', 'Please add a bank account first.', [
        { text: 'Add Account', onPress: () => navigation.navigate('AddBankAccount') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    try {
      setSubmitting(true);

      const response = await payoutService.requestPayout({
        amount: withdrawAmount,
        bankDetails: {
          accountHolderName: selectedBank.accountHolderName,
          accountNumber: selectedBank.accountNumber,
          ifscCode: selectedBank.ifscCode,
          bankName: selectedBank.bankName,
          upiId: selectedBank.upiId,
        },
      });

      if (response.success) {
        Alert.alert('Success', 'Withdrawal request submitted successfully!', [
          {
            text: 'View Requests',
            onPress: () => navigation.replace('PayoutRequests'),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('❌ [Withdraw] Error:', error);
      Alert.alert('Error', error.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBankModal = () => (
    <Modal
      visible={showBankModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBankModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank Account</Text>
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bankList}>
            {bankAccounts.map(bank => (
              <TouchableOpacity
                key={bank._id}
                style={[
                  styles.bankOption,
                  selectedBank?._id === bank._id && styles.bankOptionSelected,
                ]}
                onPress={() => {
                  setSelectedBank(bank);
                  setShowBankModal(false);
                }}
              >
                <View style={styles.bankIcon}>
                  <Icon name="bank" size={24} color="#372643" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankTitle}>{bank.bankName || 'Bank Account'}</Text>
                  <Text style={styles.bankSubtitle}>
                    {bank.accountHolderName}
                  </Text>
                  <Text style={styles.bankSubtitle}>
                    **** **** **** {bank.accountNumber.slice(-4)}
                  </Text>
                </View>
                {selectedBank?._id === bank._id && (
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addBankBtn}
            onPress={() => {
              setShowBankModal(false);
              navigation.navigate('AddBankAccount');
            }}
          >
            <Icon name="plus-circle" size={20} color="#372643" />
            <Text style={styles.addBankText}>Add New Bank Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            {loading ? (
              <ActivityIndicator color="#FFF" style={{ marginTop: 10 }} />
            ) : (
              <>
                <Text style={styles.balanceAmount}>
                  {payoutService.formatAmount(balance)}
                </Text>
                {stats && (
                  <>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Earned</Text>
                        <Text style={styles.statValue}>
                          {payoutService.formatAmount(stats.totalEarned)}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Withdrawn</Text>
                        <Text style={styles.statValue}>
                          {payoutService.formatAmount(stats.totalWithdrawn)}
                        </Text>
                      </View>
                    </View>

                    {/* ✅ Earnings Breakdown - Using Real API Fields */}
                    <View style={styles.breakdownContainer}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Gross Earnings</Text>
                        <Text style={styles.breakdownValue}>
                          {payoutService.formatAmount(stats.totalEarned)}
                        </Text>
                      </View>
                      
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>
                          Platform Fee (40%)
                        </Text>
                        <Text style={[styles.breakdownValue, styles.deduction]}>
                          - {payoutService.formatAmount(stats.platformCommission)}
                        </Text>
                      </View>
                      
                      {stats.totalPenalties > 0 && (
                        <View style={styles.breakdownRow}>
                          <View style={styles.penaltyLabelRow}>
                            <Text style={styles.breakdownLabel}>Penalties</Text>
                            <Icon name="alert-circle" size={14} color="#FFCDD2" style={{ marginLeft: 4 }} />
                          </View>
                          <Text style={[styles.breakdownValue, styles.deduction]}>
                            - {payoutService.formatAmount(stats.totalPenalties)}
                          </Text>
                        </View>
                      )}
                      
                      {stats.totalWithdrawn > 0 && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Already Withdrawn</Text>
                          <Text style={[styles.breakdownValue, styles.deduction]}>
                            - {payoutService.formatAmount(stats.totalWithdrawn)}
                          </Text>
                        </View>
                      )}
                      
                      {stats.pendingWithdrawal > 0 && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Pending Withdrawal</Text>
                          <Text style={[styles.breakdownValue, styles.deduction]}>
                            - {payoutService.formatAmount(stats.pendingWithdrawal)}
                          </Text>
                        </View>
                      )}
                      
                      <View style={[styles.breakdownRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Available to Withdraw</Text>
                        <Text style={styles.totalValue}>
                          {payoutService.formatAmount(stats.withdrawableAmount)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#CCC"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={styles.hintRow}>
              <Text style={styles.hint}>Minimum withdrawal: ₹500</Text>
              <TouchableOpacity onPress={() => setAmount(String(balance))}>
                <Text style={styles.maxBtn}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bank Details */}
          {selectedBank ? (
            <View style={styles.bankCard}>
              <View style={styles.bankIcon}>
                <Icon name="bank" size={24} color="#372643" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankTitle}>
                  {selectedBank.bankName || 'Bank Account'}
                </Text>
                <Text style={styles.bankSubtitle}>
                  {selectedBank.accountHolderName}
                </Text>
                <Text style={styles.bankSubtitle}>
                  **** **** **** {selectedBank.accountNumber.slice(-4)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowBankModal(true)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBankCard}
              onPress={() => navigation.navigate('AddBankAccount')}
            >
              <Icon name="plus-circle" size={24} color="#372643" />
              <Text style={styles.addBankCardText}>Add Bank Account</Text>
            </TouchableOpacity>
          )}

          {/* View Requests Button */}
          <TouchableOpacity
            style={styles.viewRequestsBtn}
            onPress={() => navigation.navigate('PayoutRequests')}
          >
            <Icon name="clipboard-text-outline" size={20} color="#372643" />
            <Text style={styles.viewRequestsText}>View Withdrawal Requests</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.withdrawBtn, (loading || submitting) && styles.disabledBtn]}
            onPress={handleWithdraw}
            disabled={loading || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Request Withdrawal</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderBankModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  content: { padding: 20 },

  balanceCard: {
    backgroundColor: '#372643',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: { color: '#E0E0E0', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#E0E0E0',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  breakdownContainer: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  penaltyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  deduction: {
    color: '#FFCDD2',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },

  inputSection: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', color: '#333', marginRight: 10 },
  input: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#333' },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hint: { fontSize: 12, color: '#999', marginLeft: 4 },
  maxBtn: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#372643',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E8EAF6',
    borderRadius: 4,
  },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  bankSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  changeText: { color: '#372643', fontWeight: '600', marginLeft: 'auto' },

  addBankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#372643',
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 12,
  },
  addBankCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#372643',
  },

  viewRequestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EAF6',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  viewRequestsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#372643',
  },

  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  withdrawBtn: {
    backgroundColor: '#4CAF50',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#A5D6A7' },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bankList: {
    padding: 16,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bankOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    gap: 8,
  },
  addBankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#372643',
  },
});

export default WalletWithdrawScreen;
