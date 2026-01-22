// src/screens/TabsScreen/ProfileScreen.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { astrologerService } from '../../services/api/astrologer.service';
import ScreenWrapper from '../../component/ScreenWrapper';
import { styles } from '../../style/ProfileStyle';

const ProfileScreen = ({ navigation }) => {
  const { state, logout } = useAuth();
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const astrologer = state?.astrologer || {};

  // ✅ Navigation Handlers
  const handleEditProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation]);
  const handleAvailability = useCallback(() => navigation.navigate('Availability'), [navigation]);
  const handleServices = useCallback(() => navigation.navigate('Services'), [navigation]);
  const handleAccountSettings = useCallback(() => navigation.navigate('Setting'), [navigation]);
  
  // ✅ NEW: Handle Reviews Navigation
  const handleMyReviews = useCallback(() => navigation.navigate('AstrologerReviews'), [navigation]);

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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], 
            });
          } 
        },
      ]
    );
  }, [logout, navigation]);

  // Data
  const name = astrologer?.name || 'Astrologer';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const experience = astrologer?.experienceYears || 0;
  const languages = Array.isArray(astrologer?.languages) ? astrologer.languages.join(', ') : 'English, Hindi';
  const specialities = (astrologer?.specializations && astrologer.specializations.length > 0) ? astrologer.specializations : ['Vedic Astrology', 'Kundli'];
  const stats = profileStats?.stats || {};
  const ratings = profileStats?.ratings || {};
  const totalConsultations = stats.totalOrders || 0;
  const totalMinutes = stats.totalMinutes || 0;
  const avgRating = ratings.average?.toFixed(1) || '5.0';
  const totalReviews = ratings.total || 0;

  return (
    <ScreenWrapper backgroundColor="#ffffff" barStyle="dark-content">
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {astrologer?.profilePicture ? (
              <Avatar.Image size={70} source={{ uri: astrologer.profilePicture }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={70} label={initials} style={styles.avatar} labelStyle={styles.avatarLabel} />
            )}
            <View style={styles.verifiedIcon}>
              <Icon name="verified" size={18} color="#4CAF50" />
            </View>
          </View>
          
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Professional Astrologer</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{avgRating}</Text>
            </View>
            <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
          </View>
          
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#5A5DC2" /></View>
            ) : (
              <>
                <StatCard value={totalConsultations} label="Orders" icon="shopping-bag" color="#5A5DC2" />
                <StatCard value={`${totalMinutes}m`} label="Minutes" icon="access-time" color="#FF9800" />
                <StatCard value={`${avgRating}★`} label="Rating" icon="star" color="#FFB300" />
              </>
            )}
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            <View style={styles.menuList}>
              
              <MenuItem 
                icon="edit" iconColor="#1976D2" bgColor="#E3F2FD" 
                title="Edit Profile" subtitle="Update your information" 
                onPress={handleEditProfile} 
              />

              {/* ✅ NEW: My Reviews Button */}
              <MenuItem 
                icon="star-rate" iconColor="#FBC02D" bgColor="#FFF9C4" 
                title="My Reviews" subtitle="See what users say" 
                onPress={handleMyReviews} 
              />

              <MenuItem 
                icon="schedule" iconColor="#388E3C" bgColor="#E8F5E9" 
                title="Availability" subtitle="Manage working hours" 
                onPress={handleAvailability} 
              />

              <MenuItem 
                icon="work" iconColor="#F57C00" bgColor="#FFF3E0" 
                title="My Services" subtitle="View service offerings" 
                onPress={handleServices} 
              />

              <MenuItem 
                icon="settings" iconColor="#607D8B" bgColor="#ECEFF1" 
                title="Settings" subtitle="Account preferences" 
                onPress={handleAccountSettings} 
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Icon name="logout" size={20} color="#D32F2F" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const StatCard = ({ value, label, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, iconColor, bgColor, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
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

export default ProfileScreen;