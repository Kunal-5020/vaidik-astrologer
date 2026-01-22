// src/screens/main_screens/WalletWithdrawScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';
import { useToast } from '../../contexts/ToastContext';
import { styles } from '../../style/WalletWithdrawStyle';

const WalletWithdrawScreen = ({ navigation }) => {
  // ✅ ADDED: destructure showToast
  const { showToast } = useToast();
  
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
      showToast('Failed to fetch wallet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      // ✅ REPLACED Alerts with Toast
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Insufficient Funds', 'error');
      return;
    }

    if (withdrawAmount < 500) {
      showToast('Minimum withdrawal amount is ₹500', 'error');
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
        // ✅ REPLACED Alerts with Toast + Success Navigation
        showToast('Withdrawal request submitted!', 'success');
        setTimeout(() => {
          navigation.replace('PayoutRequests');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ [Withdraw] Error:', error);
      showToast(error.message || 'Failed to process request', 'error');
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
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false}>
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
    </ScreenWrapper>
  );
};

export default WalletWithdrawScreen;