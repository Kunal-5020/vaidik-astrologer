// src/screens/main_screens/AccountSettingsScreen.js

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

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
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Please contact support to process account deletion.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Contact Support", 
          onPress: () => navigation.navigate('HelpSupport')
        }
      ]
    );
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => {
      console.error("❌ [AccountSettings] Link error:", err);
      Alert.alert('Error', 'Could not open the link');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

          <TouchableOpacity 
            style={styles.row} 
            onPress={() => openLink('https://vaidiktalk.com/terms-conditions')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6FA',
  },
  scrollArea: { 
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: Math.min(width * 0.04, 16),
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  card: {
    backgroundColor: '#fff',
    marginHorizontal: Math.min(width * 0.04, 16),
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  
  iconCircle: {
    backgroundColor: '#F3F4F6',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  rowTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827',
  },
  
  rowSubtitle: { 
    fontSize: 11, 
    color: '#6B7280',
    marginTop: 2,
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  
  actionsContainer: {
    marginVertical: 8,
    marginHorizontal: Math.min(width * 0.04, 16),
    gap: 10,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    gap: 8,
  },
  
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
