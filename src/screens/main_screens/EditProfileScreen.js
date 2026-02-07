// src/screens/main_screens/EditProfileScreen.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ScreenWrapper from '../../component/ScreenWrapper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Custom Components
import ProfileImageModal from '../../component/ProfileImageModal';
import {
  requestCameraPermission,
} from '../../component/AppPermission';

// Services & Context
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { astrologerService } from '../../services/api/astrologer.service';
import { uploadService } from '../../services/api/upload.service';
import { styles } from '../../style/EditProfileStyle';

const EditProfileScreen = ({ navigation }) => {
  const { state, updateAstrologer } = useAuth();
  const { showToast } = useToast();
  const { astrologer } = state;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // ✅ Track initial state to detect changes
  const [initialForm, setInitialForm] = useState(null);
  
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

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleCheckbox = useCallback((category, key) => {
    setForm(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
  }, []);

  // ✅ Check if form has changed from initial state
  const hasChanges = useMemo(() => {
    if (!initialForm) return false;

    // Check simple fields
    if (form.name !== initialForm.name) return true;
    if (form.experience !== initialForm.experience) return true;
    if (form.professionalBio !== initialForm.professionalBio) return true;
    if (form.profilePic?.uri !== initialForm.profilePic?.uri) return true;

    // Check Objects (Specializations & Languages)
    if (JSON.stringify(form.specializations) !== JSON.stringify(initialForm.specializations)) return true;
    if (JSON.stringify(form.languages) !== JSON.stringify(initialForm.languages)) return true;

    return false;
  }, [form, initialForm]);

  const openCamera = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showToast('Camera denied', 'error');
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
  }, [showToast]);

  const openGallery = useCallback(async () => {
    // ✅ REMOVED: const hasPermission = await requestGalleryPermission();
    // ✅ REMOVED: if (!hasPermission) ...

    // Just launch the library directly. 
    // It opens the system picker which is safe and Google-compliant.
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, response => {
      if (response.assets?.[0]) {
        setForm(prev => ({ ...prev, profilePic: response.assets[0] }));
        setShowImageModal(false);
      } else if (response.errorCode) {
         console.log('Image picker error:', response.errorMessage);
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!hasChanges) {
      return;
    }

    try {
      setSaving(true);

      let profilePictureUrl = astrologer?.profilePicture; 

      if (form.profilePic?.uri && !form.profilePic.uri.startsWith('http')) {
        try {
          console.log('📸 Uploading new profile image...');
          const uploadResult = await uploadService.uploadImage(
            form.profilePic.uri, 
            form.profilePic.type || 'image/jpeg'
          );
          
          if (uploadResult?.url) {
            profilePictureUrl = uploadResult.url;
            console.log('✅ Image uploaded:', profilePictureUrl);
          }
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          Alert.alert('Upload Error', 'Failed to upload profile image. Please try again.');
          setSaving(false);
          return;
        }
      }

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
        profilePicture: profilePictureUrl,
      };

      const response = await astrologerService.updateProfile(updateData);

      if (response.success) {
        if (updateAstrologer) {
          await updateAstrologer({
            ...astrologer,
            ...updateData,
          });
        }

        showToast('Profile Saved', 'success');
        navigation.goBack();
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
  }, [form, hasChanges, astrologer, updateAstrologer, navigation, showToast]);

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

          const loadedForm = {
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
          };

          setForm(loadedForm);
          setInitialForm(JSON.parse(JSON.stringify(loadedForm)));
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ [EditProfile] Error:', error);
        setLoading(false);
      }
    };

    loadCompleteProfile();
  }, [updateAstrologer]);

  return (
    // ✅ FIX: safeAreaTop={false} + avoidKeyboard={true}
    <ScreenWrapper 
      backgroundColor="#ffffff" 
      barStyle="dark-content" 
      safeAreaTop={false}
      avoidKeyboard={true}
    >
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
                style={[
                  styles.saveButton, 
                  (saving || !hasChanges) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={saving || !hasChanges}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>
                    {hasChanges ? 'Save Changes' : 'No Changes'}
                  </Text>
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
        </>
      )}
    </ScreenWrapper>
  );
};

export default EditProfileScreen;