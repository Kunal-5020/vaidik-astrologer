// src/screens/main_screens/AddBankAccountScreen.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { payoutService } from '../../services/api/payout.service';

const AddBankAccountScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingBankName, setFetchingBankName] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const accountNumberRef = useRef(null);
  const confirmAccountNumberRef = useRef(null);
  const ifscRef = useRef(null);
  const branchRef = useRef(null);
  const upiRef = useRef(null);

  const validateAccountHolderName = (name) => {
    if (!name || name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name should only contain letters';
    }
    return null;
  };

  const validateAccountNumber = (number) => {
    if (!payoutService.validateAccountNumber(number)) {
      return 'Account number must be 9-18 digits';
    }
    return null;
  };

  const validateIFSC = (ifsc) => {
    if (!payoutService.validateIFSC(ifsc.toUpperCase())) {
      return 'Invalid IFSC code';
    }
    return null;
  };

  const validateUPI = (upi) => {
    if (upi && !payoutService.validateUPI(upi)) {
      return 'Invalid UPI ID';
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    if (field === 'ifscCode' && value.length === 11) {
      fetchBankNameFromIFSC(value);
    }
  };

  const fetchBankNameFromIFSC = async (ifscCode) => {
    const ifscUpper = ifscCode.toUpperCase();
    
    if (!payoutService.validateIFSC(ifscUpper)) {
      setErrors(prev => ({ ...prev, ifscCode: 'Invalid IFSC code' }));
      return;
    }

    try {
      setFetchingBankName(true);
      
      const bankCodes = {
        SBIN: 'State Bank of India',
        HDFC: 'HDFC Bank',
        ICIC: 'ICICI Bank',
        AXIS: 'Axis Bank',
        PUNB: 'Punjab National Bank',
        UBIN: 'Union Bank of India',
        IDIB: 'Indian Bank',
        BARB: 'Bank of Baroda',
        CNRB: 'Canara Bank',
        IOBA: 'Indian Overseas Bank',
        UTIB: 'Axis Bank',
        KKBK: 'Kotak Mahindra Bank',
        YESB: 'Yes Bank',
        INDB: 'IndusInd Bank',
        FDRL: 'Federal Bank',
      };

      const bankCode = ifscUpper.substring(0, 4);
      const bankName = bankCodes[bankCode] || 'Unknown Bank';

      setFormData(prev => ({ ...prev, bankName }));
    } catch (error) {
      console.error('❌ [AddBankAccount] IFSC error:', error);
    } finally {
      setFetchingBankName(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateAccountHolderName(formData.accountHolderName);
    if (nameError) newErrors.accountHolderName = nameError;

    const accountError = validateAccountNumber(formData.accountNumber);
    if (accountError) newErrors.accountNumber = accountError;

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    const ifscError = validateIFSC(formData.ifscCode);
    if (ifscError) newErrors.ifscCode = ifscError;

    if (formData.upiId) {
      const upiError = validateUPI(formData.upiId);
      if (upiError) newErrors.upiId = upiError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors');
      return;
    }

    try {
      setLoading(true);

      const response = await payoutService.addBankAccount({
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        bankName: formData.bankName || undefined,
        branchName: formData.branchName || undefined,
        upiId: formData.upiId || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Bank account added successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (route.params?.onSuccess) {
                  route.params.onSuccess(response.data);
                }
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ [AddBankAccount] Error:', error);
      Alert.alert('Error', error.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="shield-check" size={18} color="#372643" />
            <Text style={styles.infoText}>
              Your bank details are securely encrypted
            </Text>
          </View>

          {/* Account Holder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Account Holder Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.accountHolderName && styles.inputError]}>
              <Icon name="account-outline" size={18} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="As per bank account"
                placeholderTextColor="#999"
                value={formData.accountHolderName}
                onChangeText={(text) => handleInputChange('accountHolderName', text)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => accountNumberRef.current?.focus()}
              />
            </View>
            {errors.accountHolderName && (
              <Text style={styles.errorText}>{errors.accountHolderName}</Text>
            )}
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Account Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.accountNumber && styles.inputError]}>
              <Icon name="bank-outline" size={18} color="#999" />
              <TextInput
                ref={accountNumberRef}
                style={styles.input}
                placeholder="Enter account number"
                placeholderTextColor="#999"
                value={formData.accountNumber}
                onChangeText={(text) => handleInputChange('accountNumber', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={18}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmAccountNumberRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.accountNumber && (
              <Text style={styles.errorText}>{errors.accountNumber}</Text>
            )}
          </View>

          {/* Confirm Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirm Account Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.confirmAccountNumber && styles.inputError]}>
              <Icon name="bank-check" size={18} color="#999" />
              <TextInput
                ref={confirmAccountNumberRef}
                style={styles.input}
                placeholder="Re-enter account number"
                placeholderTextColor="#999"
                value={formData.confirmAccountNumber}
                onChangeText={(text) => handleInputChange('confirmAccountNumber', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={18}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => ifscRef.current?.focus()}
              />
            </View>
            {errors.confirmAccountNumber && (
              <Text style={styles.errorText}>{errors.confirmAccountNumber}</Text>
            )}
          </View>

          {/* IFSC Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              IFSC Code <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.ifscCode && styles.inputError]}>
              <Icon name="code-tags" size={18} color="#999" />
              <TextInput
                ref={ifscRef}
                style={styles.input}
                placeholder="e.g., SBIN0001234"
                placeholderTextColor="#999"
                value={formData.ifscCode}
                onChangeText={(text) => handleInputChange('ifscCode', text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={11}
                returnKeyType="next"
                onSubmitEditing={() => branchRef.current?.focus()}
              />
              {fetchingBankName && (
                <ActivityIndicator size="small" color="#372643" />
              )}
            </View>
            {errors.ifscCode && (
              <Text style={styles.errorText}>{errors.ifscCode}</Text>
            )}
          </View>

          {/* Bank Name */}
          {formData.bankName && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Icon name="bank" size={18} color="#999" />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.bankName}
                  editable={false}
                />
                <Icon name="check-circle" size={18} color="#4CAF50" />
              </View>
            </View>
          )}

          {/* Branch Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch Name (Optional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="map-marker-outline" size={18} color="#999" />
              <TextInput
                ref={branchRef}
                style={styles.input}
                placeholder="Enter branch name"
                placeholderTextColor="#999"
                value={formData.branchName}
                onChangeText={(text) => handleInputChange('branchName', text)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => upiRef.current?.focus()}
              />
            </View>
          </View>

          {/* UPI ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>UPI ID (Optional)</Text>
            <View style={[styles.inputContainer, errors.upiId && styles.inputError]}>
              <Icon name="at" size={18} color="#999" />
              <TextInput
                ref={upiRef}
                style={styles.input}
                placeholder="username@bank"
                placeholderTextColor="#999"
                value={formData.upiId}
                onChangeText={(text) => handleInputChange('upiId', text.toLowerCase())}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {errors.upiId && (
              <Text style={styles.errorText}>{errors.upiId}</Text>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon name="check-circle-outline" size={20} color="#FFF" />
                <Text style={styles.submitBtnText}>Add Bank Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#372643',
    lineHeight: 16,
  },

  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputDisabled: {
    backgroundColor: '#F5F6FA',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  disabledInput: {
    color: '#666',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#372643',
    height: 50,
    borderRadius: 10,
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default AddBankAccountScreen;
