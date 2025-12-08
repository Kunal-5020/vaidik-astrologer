// src/screens/main_screens/EditProfileScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Custom Components
import ProfileImageModal from '../../component/ProfileImageModal';
import CustomToast from '../../component/CustomToast';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../component/AppPermission';

// Services & Context
import { useAuth } from '../../contexts/AuthContext';
import { astrologerService } from '../../services/api/astrologer.service';

const { width } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }) => {
  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL RENDERING
  const { state, updateAstrologer } = useAuth();
  const { astrologer } = state;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [form, setForm] = useState({
    profilePic: null,
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    experience: '',
    specializations: {
      'Vedic Astrology': false,
      'Tarot': false,
      'Numerology': false,
      'Palmistry': false,
      'Vastu': false,
    },
    languages: {
      'English': false,
      'Hindi': false,
      'Gujarati': false,
      'Marathi': false,
    },
    professionalBio: '',
  });

  const showCustomToast = useCallback((message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleCheckbox = useCallback((category, key) => {
    setForm(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
  }, []);

  const openCamera = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showCustomToast('Camera permission denied');
      return;
    }
    launchCamera(
      { mediaType: 'photo', cameraType: 'front', quality: 0.5 },
      response => {
        if (response.assets?.[0]) {
          setForm(prev => ({ ...prev, profilePic: response.assets[0] }));
          setShowImageModal(false);
        }
      }
    );
  }, [showCustomToast]);

  const openGallery = useCallback(async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      showCustomToast('Gallery permission denied');
      return;
    }
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, response => {
      if (response.assets?.[0]) {
        setForm(prev => ({ ...prev, profilePic: response.assets[0] }));
        setShowImageModal(false);
      }
    });
  }, [showCustomToast]);

  const handleSave = useCallback(async () => {
    if (!form.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setSaving(true);

      const selectedSpecializations = Object.keys(form.specializations)
        .filter(key => form.specializations[key]);

      const selectedLanguages = Object.keys(form.languages)
        .filter(key => form.languages[key]);

      const updateData = {
        name: form.name,
        bio: form.professionalBio,
        experienceYears: parseInt(form.experience) || 0,
        specializations: selectedSpecializations,
        languages: selectedLanguages,
      };

      const response = await astrologerService.updateProfile(updateData);

      if (response.success) {
        if (updateAstrologer) {
          await updateAstrologer({
            ...astrologer,
            ...updateData,
          });
        }

        showCustomToast('Profile updated successfully!');
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ [EditProfile] Error:', error);
      
      if (error.message && Array.isArray(error.message)) {
        Alert.alert('Validation Error', error.message.join('\n'));
      } else {
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  }, [form, astrologer, updateAstrologer, navigation, showCustomToast]);

  useEffect(() => {
    const loadCompleteProfile = async () => {
      try {
        const response = await astrologerService.getCompleteProfile();

        if (response.success && response.data) {
          const profile = response.data;

          if (updateAstrologer) {
            await updateAstrologer(profile);
          }

          const specs = {
            'Vedic Astrology': false,
            'Tarot': false,
            'Numerology': false,
            'Palmistry': false,
            'Vastu': false,
          };

          if (profile.specializations && Array.isArray(profile.specializations)) {
            profile.specializations.forEach(s => {
              Object.keys(specs).forEach(key => {
                if (key.toLowerCase() === s.toLowerCase()) {
                  specs[key] = true;
                }
              });
            });
          }

          const langs = {
            'English': false,
            'Hindi': false,
            'Gujarati': false,
            'Marathi': false,
          };

          if (profile.languages && Array.isArray(profile.languages)) {
            profile.languages.forEach(l => {
              Object.keys(langs).forEach(key => {
                if (key.toLowerCase() === l.toLowerCase()) {
                  langs[key] = true;
                }
              });
            });
          }

          let formattedDOB = '';
          if (profile.dateOfBirth) {
            const dobDateObj = new Date(profile.dateOfBirth);
            formattedDOB = dobDateObj.toLocaleDateString('en-US');
          }

          setForm({
            profilePic: profile.profilePicture
              ? { uri: profile.profilePicture }
              : null,
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phoneNumber || '',
            gender: profile.gender || '',
            dob: formattedDOB,
            experience: profile.experienceYears !== undefined
              ? String(profile.experienceYears)
              : '',
            specializations: specs,
            languages: langs,
            professionalBio: profile.bio || '',
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ [EditProfile] Error:', error);
        setLoading(false);
      }
    };

    loadCompleteProfile();
  }, [updateAstrologer]);

  // ✅ NOW SAFE TO RENDER CONDITIONALLY
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Image */}
            <View style={styles.profileWrapper}>
              <View style={styles.profileContainer}>
                <Image
                  source={
                    form.profilePic?.uri
                      ? { uri: form.profilePic.uri }
                      : require('../../assets/man.png')
                  }
                  style={styles.profileImage}
                />
              </View>
              <TouchableOpacity
                style={styles.cameraContainer}
                onPress={() => setShowImageModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={18} color="#372643" />
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.inputField}
                value={form.name}
                onChangeText={text => updateField('name', text)}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Email Address</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText} numberOfLines={1}>
                  {form.email || 'Not Available'}
                </Text>
                <Ionicons name="mail-outline" size={18} color="#666" />
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>
                  {form.phone || 'Not Available'}
                </Text>
                <Ionicons name="call-outline" size={18} color="#666" />
              </View>

              <Text style={styles.label}>Gender</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>
                  {form.gender
                    ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
                    : 'Not Specified'}
                </Text>
                <Ionicons name="person-outline" size={18} color="#666" />
              </View>

              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>{form.dob || 'Not Set'}</Text>
                <Ionicons name="calendar-outline" size={18} color="#666" />
              </View>
            </View>

            {/* Professional Details */}
            <Text style={styles.sectionTitle}>Professional Details</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.inputField}
                value={form.experience}
                onChangeText={text => updateField('experience', text)}
                keyboardType="numeric"
                placeholder="e.g. 5"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Specializations</Text>
              <View style={styles.checkboxContainer}>
                {Object.keys(form.specializations).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.checkboxRow}
                    onPress={() => toggleCheckbox('specializations', key)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={
                        form.specializations[key] ? styles.checked : styles.unchecked
                      }
                    >
                      {form.specializations[key] && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Languages</Text>
              <View style={styles.checkboxGrid}>
                {Object.keys(form.languages).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.checkboxRow, styles.halfWidth]}
                    onPress={() => toggleCheckbox('languages', key)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={form.languages[key] ? styles.checked : styles.unchecked}
                    >
                      {form.languages[key] && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{key}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Professional Bio</Text>
              <TextInput
                style={[styles.inputField, styles.bioInput]}
                multiline
                maxLength={500}
                value={form.professionalBio}
                onChangeText={text => updateField('professionalBio', text)}
                placeholder="Tell us about your expertise..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {form.professionalBio.length}/500
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          <ProfileImageModal
            visible={showImageModal}
            onClose={() => setShowImageModal(false)}
            onTakePhoto={openCamera}
            onChooseGallery={openGallery}
            onRemovePhoto={() => {
              setForm(prev => ({ ...prev, profilePic: null }));
              setShowImageModal(false);
            }}
            hasPhoto={!!form.profilePic}
          />

          {showToast && <CustomToast message={toastMessage} />}
        </>
      )}
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  scroll: {
    paddingHorizontal: Math.min(width * 0.05, 20),
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#372643',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#E8EAF6',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraContainer: {
    position: 'absolute',
    bottom: 0,
    right: width < 360 ? '32%' : '36%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#372643',
  },
  sectionTitle: {
    color: '#372643',
    marginTop: 20,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#372643',
    paddingBottom: 6,
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
  label: {
    color: '#333',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  inputField: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readOnlyContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  halfWidth: {
    width: '50%',
  },
  checked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#372643',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#372643',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#999',
    fontSize: 11,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#372643',
  },
  cancelText: {
    color: '#372643',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#372643',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#372643',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
