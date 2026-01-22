// src/screens/main_screens/AccountSettingsScreen.js

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from '../../style/AccountSettingStyle';
import { astrologerService } from '../../services/api/astrologer.service';

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], 
            });
            } catch (error) {
              console.error('❌ [AccountSettings] Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    // 1. First Warning
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to delete your account? This action is serious.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          style: "destructive", 
          onPress: showFinalConfirmation // Go to step 2
        }
      ]
    );
  };

  // ✅ Step 2: Policy Explanation & Execution
  const showFinalConfirmation = () => {
    Alert.alert(
      "Final Confirmation",
      "Your account will be deactivated immediately.\n\nIt will be PERMANENTLY deleted after 7 days.\n\nIf you change your mind, simply login within 7 days to restore it.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: processDeletion 
        }
      ]
    );
  };

  // ✅ Step 3: API Call
  const processDeletion = async () => {
    setLoading(true);
    try {
      await astrologerService.deleteAccount("User requested deletion via App");
      
      Alert.alert(
        "Account Scheduled for Deletion",
        "You have been logged out. Your account will be permanently removed in 7 days.",
        [
          { 
            text: "OK", 
            onPress: async () => {
              await logout(); // Logout immediately
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], 
              });
            } 
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not delete account. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => {
      console.error("❌ [AccountSettings] Link error:", err);
      Alert.alert('Error', 'Could not open the link');
    });
  };

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="light-content" safeAreaTop={false }>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: 'white', marginTop: 10, fontWeight: 'bold' }}>Processing...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Finance & Earnings */}
        <Text style={styles.sectionTitle}>Finance</Text>
        <View style={styles.card}>
          
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WalletWithdraw')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="bank-transfer" size={20} color="#10B981" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Withdraw Funds</Text>
                <Text style={styles.rowSubtitle}>Manage bank accounts & payouts</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row}
            onPress={() => navigation.navigate('PayoutRequests')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="history" size={20} color="#F59E0B" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Payout Requests</Text>
                <Text style={styles.rowSubtitle}>View past withdrawals</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account & Security */}
        <Text style={styles.sectionTitle}>Account & Settings</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8EAF6' }]}>
                <Icon name="account-edit-outline" size={20} color="#372643" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Edit Profile</Text>
                <Text style={styles.rowSubtitle}>Update name, bio, and details</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('PerformanceAnalysis')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="chart-line" size={20} color="#3B82F6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Performance Analysis</Text>
                <Text style={styles.rowSubtitle}>Check your growth metrics</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <View style={styles.card}>
          
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('HelpSupport')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Icon name="lifebuoy" size={20} color="#9333EA" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Help & Support</Text>
                <Text style={styles.rowSubtitle}>FAQs and Customer Care</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* ✅ UPDATED LINK */}
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => openLink('https://vaidiktalk.com/privacy-policy')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="shield-lock-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* ✅ UPDATED LINK */}
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => openLink('https://vaidiktalk.com/terms-and-conditions')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="file-document-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>Terms & Conditions</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="logout" size={18} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Icon name="delete-forever" size={18} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}