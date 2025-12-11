// src/screens/TabsScreen/ProfileScreen.js (FIXED HOOKS ORDER)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { astrologerService } from '../../services/api/astrologer.service';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
  // ✅ ALL HOOKS MUST BE AT THE TOP - NO CONDITIONS BEFORE THIS
  const { state, logout } = useAuth();
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Memoized callback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await astrologerService.getProfile();
      if (data?.success) {
        setProfileStats(data.data);
      }
    } catch (error) {
      console.log('❌ [Profile] Stats fetch error', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Focus effect
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // ✅ NOW we can safely use state
  const astrologer = state?.astrologer || {};

  // Handlers
  const handleEditProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation]);
  const handleAvailability = useCallback(() => navigation.navigate('Availability'), [navigation]);
  const handleServices = useCallback(() => navigation.navigate('Services'), [navigation]);
  const handleAccountSettings = useCallback(() => navigation.navigate('Setting'), [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            navigate('Login');
          } 
        },
      ]
    );
  }, [logout]);

  // Data Preparation
  const name = astrologer?.name || 'Astrologer';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const experience = astrologer?.experienceYears || 0;
  const languages = Array.isArray(astrologer?.languages) 
    ? astrologer.languages.join(', ') 
    : 'English, Hindi';
  
  const specialities = (astrologer?.specializations && astrologer.specializations.length > 0)
    ? astrologer.specializations 
    : ['Vedic Astrology', 'Kundli'];

  const stats = profileStats?.stats || {};
  const ratings = profileStats?.ratings || {};
  
  const totalConsultations = stats.totalOrders || 0;
  const totalMinutes = stats.totalMinutes || 0;
  const avgRating = ratings.average?.toFixed(1) || '5.0';
  const totalReviews = ratings.total || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#372643" barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Purple Header */}
        <View style={styles.header}>
          {/* Avatar with Premium Border */}
          <View style={styles.avatarContainer}>
            {astrologer?.profilePicture ? (
              <Avatar.Image 
                size={70} 
                source={{ uri: astrologer.profilePicture }} 
                style={styles.avatar} 
              />
            ) : (
              <Avatar.Text 
                size={70} 
                label={initials} 
                style={styles.avatar} 
                labelStyle={styles.avatarLabel} 
              />
            )}
            <View style={styles.verifiedIcon}>
              <Icon name="verified" size={18} color="#4CAF50" />
            </View>
          </View>
          
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Professional Astrologer</Text>
          
          {/* Rating Badge */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{avgRating}</Text>
            </View>
            <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
          </View>
          
          {/* Experience & Languages */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="work-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{experience}+ yrs</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Icon name="language" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText} numberOfLines={1}>{languages}</Text>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#5A5DC2" />
              </View>
            ) : (
              <>
                <StatCard 
                  value={totalConsultations} 
                  label="Total Orders" 
                  icon="shopping-bag"
                  color="#5A5DC2"
                />
                <StatCard 
                  value={`${totalMinutes}m`} 
                  label="Minutes" 
                  icon="access-time"
                  color="#FF9800"
                />
                <StatCard 
                  value={`${avgRating}★`} 
                  label="Rating" 
                  icon="star"
                  color="#FFB300"
                />
              </>
            )}
          </View>

          {/* Specializations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <View style={styles.chipsContainer}>
              {specialities.map((item, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.chip}
                  textStyle={styles.chipText}
                  icon={() => <Icon name="auto-awesome" size={14} color="#5A5DC2" />}
                >
                  {item}
                </Chip>
              ))}
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            
            <View style={styles.menuList}>
              <MenuItem 
                icon="edit" 
                iconColor="#1976D2" 
                bgColor="#E3F2FD" 
                title="Edit Profile" 
                subtitle="Update your information"
                onPress={handleEditProfile} 
              />

              <MenuItem 
                icon="schedule" 
                iconColor="#388E3C" 
                bgColor="#E8F5E9" 
                title="Availability" 
                subtitle="Manage working hours"
                onPress={handleAvailability} 
              />

              <MenuItem 
                icon="work" 
                iconColor="#F57C00" 
                bgColor="#FFF3E0" 
                title="My Services" 
                subtitle="View service offerings"
                onPress={handleServices} 
              />

              <MenuItem 
                icon="settings" 
                iconColor="#607D8B" 
                bgColor="#ECEFF1" 
                title="Settings" 
                subtitle="Account preferences"
                onPress={handleAccountSettings} 
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="logout" size={20} color="#D32F2F" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Stat Card Component
const StatCard = ({ value, label, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Menu Item Component
const MenuItem = ({ icon, iconColor, bgColor, title, subtitle, onPress }) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIconBox, { backgroundColor: bgColor }]}>
      <Icon name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={24} color="#D1D5DB" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#372643' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#372643',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#FFB300',
    borderWidth: 0,
  },
  avatarLabel: { 
    fontWeight: 'bold', 
    fontSize: 26,
    color: '#FFF',
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  name: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: { 
    color: '#FFF', 
    fontSize: 13,
    fontWeight: 'bold',
  },
  reviewCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 6,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  content: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },

  statsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
    minHeight: 100,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 12, 
    color: '#6B7280',
    fontWeight: '500',
  },

  section: { 
    paddingHorizontal: 20, 
    marginBottom: 24,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#111827',
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  chipsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  chip: { 
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    height: 36,
  },
  chipText: { 
    fontSize: 13, 
    color: '#374151',
    fontWeight: '500',
  },

  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuList: { 
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: { 
    flex: 1,
  },
  menuTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
});

export default ProfileScreen;
