// src/screens/auth/RegistrationFormScreen.js

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useRegistration } from '../../contexts';
import ProfileImageModal from '../../component/ProfileImageModal';
import {
  requestAllMediaPermissions,
  checkMediaPermissions,
} from '../../utils/permissions';
import { uploadService } from '../../services/api/upload.service';

const { width } = Dimensions.get('window');

// ===== CONSTANTS =====

const TOTAL_STEPS = 8;
const DEV_MODE = __DEV__;

const SKILLS_DATA = [
  'vedic',
  'numerology',
  'tarot',
  'palmistry',
  'vastu',
  'face-reading',
  'kp',
  'nadi',
  'horoscope',
  'kundli',
  'prashna',
  'muhurat',
  'life-coach',
  'psychic'
];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  dateOfBirth: null,
  gender: 'null',
  bio: '',
  skills: [],
  languages: { Hindi: false, English: false, Marathi: false, Other: false },
  phoneModel: '',
  profilePicture: null,
};

// ===== MAIN COMPONENT =====

export default function RegistrationFormScreen({ navigation, route }) {
  const { saveRegistrationData, submitRegistration, state } = useRegistration();

  // ✅ Get verified phone from route params
  const verifiedPhone = route?.params?.phoneNumber || state.phoneNumber;
  const verifiedCountryCode = route?.params?.countryCode || state.countryCode;

  // ===== STATE (ALL useState FIRST) =====
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ===== EFFECTS =====

  useEffect(() => {
    if (DEV_MODE) {
      console.log('📱 Verified Phone:', verifiedPhone);
      console.log('🌍 Country Code:', verifiedCountryCode);
    }
  }, [verifiedPhone, verifiedCountryCode]);

  // ===== FORM HANDLERS (ALL useCallback IN ORDER) =====

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    Vibration.vibrate(5);
  }, []);

  const toggleLanguage = useCallback(lang => {
    setForm(prev => ({
      ...prev,
      languages: { ...prev.languages, [lang]: !prev.languages[lang] },
    }));
    Vibration.vibrate(10);
  }, []);

  const toggleSkill = useCallback(skill => {
    setForm(prev => {
      const current = prev.skills || [];
      const newSkills = current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill];
      return { ...prev, skills: newSkills };
    });
    Vibration.vibrate(10);
  }, []);

  const onChangeDate = useCallback(
    (event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        updateField('dateOfBirth', selectedDate.toISOString().split('T')[0]);
        Vibration.vibrate(20);
      }
    },
    [updateField]
  );

  // ===== IMAGE HANDLERS (DEFINE IN CORRECT ORDER) =====

  // ✅ 1. Define openCamera first
  const openCamera = useCallback(() => {
    setShowImageModal(false);

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        saveToPhotos: true,
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('📷 Camera cancelled');
          return;
        }

        if (response.errorCode) {
          console.error('❌ Camera error:', response.errorMessage);

          if (response.errorCode === 'permission') {
            Alert.alert(
              'Camera Permission Denied',
              'Please enable Camera permission in Settings.',
              [
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          } else {
            Alert.alert('Error', 'Camera error: ' + response.errorMessage);
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          updateField('profilePicture', response.assets[0].uri);
          Vibration.vibrate(50);

          if (DEV_MODE) {
            console.log('✅ Camera image selected:', response.assets[0].uri);
          }
        }
      }
    );
  }, [updateField]);

  // ✅ 2. Define openGallery second
  const openGallery = useCallback(() => {
    setShowImageModal(false);

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) {
          console.log('🖼️ Gallery cancelled');
          return;
        }

        if (response.errorCode) {
          console.error('❌ Gallery error:', response.errorMessage);

          if (response.errorCode === 'permission') {
            Alert.alert(
              'Gallery Permission Denied',
              'Please enable Gallery/Photos permission in Settings.',
              [
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          } else {
            Alert.alert('Error', 'Gallery error: ' + response.errorMessage);
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          updateField('profilePicture', response.assets[0].uri);
          Vibration.vibrate(50);

          if (DEV_MODE) {
            console.log('✅ Gallery image selected:', response.assets[0].uri);
          }
        }
      }
    );
  }, [updateField]);

  // ✅ 3. Define removePhoto third
  const removePhoto = useCallback(() => {
    updateField('profilePicture', null);
    setShowImageModal(false);
    Vibration.vibrate(30);
  }, [updateField]);

  // ✅ 4. NOW define handleProfileImagePress (after all dependencies)
  const handleProfileImagePress = useCallback(async () => {
    Vibration.vibrate(10);

    // Check current permission status
    const currentStatus = await checkMediaPermissions();

    if (currentStatus.allGranted) {
      setShowImageModal(true);
      return;
    }

    // Request both permissions
    const permissions = await requestAllMediaPermissions();

    if (DEV_MODE) {
      console.log('📋 Permission Results:', permissions);
    }

    if (!permissions.camera && !permissions.gallery) {
      Alert.alert(
        'Permissions Required',
        'Camera and Gallery permissions are needed to upload a profile picture. Please enable them in Settings.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // Open modal even if one permission is granted
    setShowImageModal(true);
  }, []); // ✅ No dependencies needed (uses state setters)

  // ===== VALIDATION =====

  const validateEmail = useCallback(mail => {
    if (!mail) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(mail).toLowerCase());
  }, []);

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0;
      case 2:
        return !!form.dateOfBirth;
      case 3:
        return form.gender && form.gender !== 'null';
      case 4:
        return Object.values(form.languages).some(v => v);
      case 5:
        return form.skills.length > 0;
      case 6:
        return !!form.phoneModel;
      case 7:
        return form.email === '' || validateEmail(form.email);
      case 8:
        return !!form.profilePicture;
      default:
        return false;
    }
  }, [step, form, validateEmail]);

  // ===== NAVIGATION =====

  const prev = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
      Vibration.vibrate(20);
    }
  }, [step]);

  const next = useCallback(async () => {
    if (!isStepValid) {
      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert('Validation', 'Please complete the current step');
      return;
    }

    if (step < TOTAL_STEPS) {
      await saveRegistrationData(form);
      setStep(s => s + 1);
      Vibration.vibrate(30);

      if (step + 1 === 2) setShowDatePicker(true);
    } else {
      // ===== FINAL SUBMISSION =====
      try {
        if (DEV_MODE) console.log('🔵 Starting registration submission...');

        let profilePictureUrl = form.profilePicture;

        // ✅ Upload profile picture
        if (form.profilePicture && form.profilePicture.startsWith('file://')) {
          setUploadingImage(true);

          try {
            const uploadResult = await uploadService.uploadImage(
              form.profilePicture
            );
            profilePictureUrl = uploadResult.url;
            if (DEV_MODE) console.log('✅ Image uploaded:', profilePictureUrl);
          } catch (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            Alert.alert(
              'Upload Failed',
              uploadError.message || 'Failed to upload profile picture'
            );
            return;
          } finally {
            setUploadingImage(false);
          }
        }

        // ✅ Convert languages to array
        const selectedLanguages = Object.keys(form.languages).filter(
          lang => form.languages[lang] === true
        );

        // ✅ Prepare final data
        const finalData = {
          phoneNumber: verifiedPhone,
          countryCode: verifiedCountryCode,
          name: form.name.trim(),
          email: form.email.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          bio: form.bio.trim(),
          skills: form.skills,
          languagesKnown: selectedLanguages,
          profilePicture: profilePictureUrl,
        };

        if (DEV_MODE) {
          console.log('📤 Submitting:', JSON.stringify(finalData, null, 2));
        }

        await saveRegistrationData(finalData);
        await submitRegistration(finalData);

        Vibration.vibrate([0, 50, 100, 50]);
        navigation.replace('ThankYou');
      } catch (error) {
        Vibration.vibrate([0, 100, 50, 100]);
        console.error('❌ Registration Error:', error);

        let errorMessage = 'Registration failed. Please try again.';

        if (error.formattedMessage) {
          errorMessage = error.formattedMessage;
        } else if (error.response?.data?.message) {
          const msg = error.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert('Error', errorMessage);
      }
    }
  }, [
    isStepValid,
    step,
    form,
    verifiedPhone,
    verifiedCountryCode,
    saveRegistrationData,
    submitRegistration,
    navigation,
  ]);

  // ===== STEP INDICATOR =====

  const StepIndicator = useMemo(() => {
    const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stepScrollContent}
        style={styles.stepScrollView}
      >
        <View style={styles.stepRow}>
          {steps.map((num, i) => {
            const active = num === step;
            const done = num < step;
            return (
              <React.Fragment key={num}>
                <View
                  style={[
                    styles.stepDot,
                    active && styles.stepDotActive,
                    done && styles.stepDotDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepDotText,
                      active && styles.stepDotTextActive,
                      done && styles.stepDotTextDone,
                    ]}
                  >
                    {num}
                  </Text>
                </View>

                {i !== steps.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      { backgroundColor: done ? '#5b2b84' : '#efe6fb' },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    );
  }, [step]);

  // ===== STEP CONTENT =====

  const renderStepContent = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Name (नाम)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={form.name}
              onChangeText={t => updateField('name', t)}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => isStepValid && next()}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Date of Birth (जन्म तिथि)</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: form.dateOfBirth ? '#111' : '#999' }}>
                {form.dateOfBirth
                  ? new Date(form.dateOfBirth).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select your date of birth'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={
                  form.dateOfBirth
                    ? new Date(form.dateOfBirth)
                    : new Date(1990, 0, 1)
                }
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Gender (लिंग)</Text>
            <View style={styles.radioContainer}>
              {['male', 'female', 'other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioRow}
                  onPress={() => updateField('gender', g)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      form.gender === g && styles.radioActive,
                    ]}
                  >
                    {form.gender === g && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Languages (भाषा)</Text>
            <Text style={styles.helperText}>Select all that you speak</Text>
            <View style={styles.languageContainer}>
              {Object.keys(form.languages).map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => toggleLanguage(l)}
                  style={[
                    styles.langBtn,
                    form.languages[l] && styles.langBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      form.languages[l]
                        ? styles.langBtnTextActive
                        : styles.langBtnText
                    }
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Skills (कोशल)</Text>
            <Text style={styles.helperText}>Select all that apply</Text>
            <View style={styles.skillsContainer}>
              {SKILLS_DATA.map(skill => {
                const selected = form.skills?.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => toggleSkill(skill)}
                    style={[
                      styles.skillButton,
                      selected && styles.skillButtonSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.symbol, selected && { color: '#fff' }]}>
                      {selected ? '✓' : '+'}
                    </Text>
                    <Text
                      style={[
                        styles.skillText,
                        selected && styles.skillTextSelected,
                      ]}
                    >
                      {skill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Which phone do you use?</Text>
            <View style={styles.phoneRow}>
              {['Android', 'iPhone'].map(option => {
                const selected = form.phoneModel === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => updateField('phoneModel', option)}
                    style={[
                      styles.phoneOption,
                      selected && styles.phoneOptionSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioActive,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.phoneLabel}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Email Address (ई-मेल)</Text>
            <Text style={styles.helperText}>Optional</Text>
            <TextInput
              placeholder="example@email.com"
              placeholderTextColor="#999"
              value={form.email}
              onChangeText={t => updateField('email', t)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={() => isStepValid && next()}
            />
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.labelProfile}>
              Profile Picture (प्रोफाइल फोटो)
            </Text>

            <View style={styles.profileWrapper}>
              <View style={styles.profileContainer}>
                <Image
                  source={
                    form.profilePicture
                      ? { uri: form.profilePicture }
                      : require('../../assets/man.png')
                  }
                  style={styles.profileImage}
                />
              </View>

              <TouchableOpacity
                style={styles.cameraContainer}
                onPress={handleProfileImagePress}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/camera.png')}
                  style={styles.cameraIcon}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.photoTip}>
              📸 Make sure your face is centered and clearly visible for the
              best impression
            </Text>

            <ProfileImageModal
              visible={showImageModal}
              onClose={() => setShowImageModal(false)}
              onTakePhoto={openCamera}
              onChooseGallery={openGallery}
              onRemovePhoto={removePhoto}
              hasPhoto={!!form.profilePicture}
            />
          </View>
        );

      default:
        return null;
    }
  }, [
    step,
    form,
    showDatePicker,
    showImageModal,
    isStepValid,
    updateField,
    toggleLanguage,
    toggleSkill,
    onChangeDate,
    handleProfileImagePress,
    openCamera,
    openGallery,
    removePhoto,
    next,
  ]);

  // ===== RENDER =====

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Step Indicator */}
        <View style={styles.stepperWrap}>{StepIndicator}</View>

        {/* Content */}
        <ScrollView
          style={styles.whitePanel}
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={prev}
            disabled={step === 1 || state.isLoading}
            style={[
              styles.prevBtn,
              (step === 1 || state.isLoading) && { opacity: 0.4 },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.prevText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={next}
            disabled={!isStepValid || state.isLoading || uploadingImage}
            style={[
              styles.nextBtn,
              (!isStepValid || state.isLoading || uploadingImage) && {
                opacity: 0.5,
              },
            ]}
            activeOpacity={0.8}
          >
            {(state.isLoading || uploadingImage) && step === TOTAL_STEPS ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.nextText}>
                {step === TOTAL_STEPS ? 'Submit' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===== STYLES ===== (Keep all your existing styles)

const styles = StyleSheet.create({
  // ... (all your existing styles - no changes needed)
  // Copy all styles from previous version
  safeArea: { flex: 1, backgroundColor: '#5b2b84' },
  container: { flex: 1, backgroundColor: '#5b2b84' },
  stepperWrap: { backgroundColor: '#5b2b84', paddingVertical: 24, paddingHorizontal: 0 },
  stepScrollView: { flexGrow: 0 },
  stepScrollContent: { paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#efe6fb', alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  stepDotActive: { backgroundColor: '#ff9a2e', transform: [{ scale: 1.15 }], shadowColor: '#ff9a2e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  stepDotDone: { backgroundColor: '#4caf50' },
  stepDotText: { fontSize: 14, fontWeight: '700', color: '#999' },
  stepDotTextActive: { color: '#fff' },
  stepDotTextDone: { color: '#fff' },
  connector: { height: 2, width: 12, marginHorizontal: 3 },
  whitePanel: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  panelContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 120 },
  stepContent: { marginBottom: 16 },
  label: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginBottom: 10 },
  labelProfile: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 24, textAlign: 'center' },
  helperText: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  input: { backgroundColor: '#f9fafb', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5, borderColor: '#e5e7eb', color: '#111' },
  radioContainer: { marginTop: 8 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  radioActive: { borderColor: '#5b2b84' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#5b2b84' },
  radioText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  languageContainer: { marginTop: 8 },
  langBtn: { backgroundColor: '#f3f4f6', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, marginBottom: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  langBtnActive: { backgroundColor: '#5b2b84', borderColor: '#5b2b84' },
  langBtnText: { fontSize: 16, color: '#374151', fontWeight: '600' },
  langBtnTextActive: { fontSize: 16, color: '#fff', fontWeight: '700' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  skillButton: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, marginBottom: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  skillButtonSelected: { backgroundColor: '#5b2b84', borderColor: '#5b2b84' },
  symbol: { fontSize: 16, fontWeight: '700', color: '#6b7280', marginRight: 6 },
  skillText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  skillTextSelected: { color: '#fff', fontWeight: '600' },
  phoneRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  phoneOption: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb' },
  phoneOptionSelected: { borderColor: '#5b2b84', backgroundColor: '#f5f0ff' },
  phoneLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  profileWrapper: { alignItems: 'center', marginVertical: 24 },
  profileContainer: { width: 150, height: 150, borderRadius: 75, overflow: 'hidden', backgroundColor: '#f3f4f6', borderWidth: 4, borderColor: '#5b2b84' },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraContainer: { position: 'absolute', bottom: 0, right: width * 0.28, width: 50, height: 50, borderRadius: 25, backgroundColor: '#5b2b84', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  cameraIcon: { width: 24, height: 24, tintColor: '#fff' },
  photoTip: { marginTop: 20, color: '#059669', textAlign: 'center', fontSize: 14, lineHeight: 22, paddingHorizontal: 20, fontWeight: '500' },
  buttonRow: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  prevBtn: { flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  prevText: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  nextBtn: { flex: 1, backgroundColor: '#5b2b84', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginLeft: 8, shadowColor: '#5b2b84', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
