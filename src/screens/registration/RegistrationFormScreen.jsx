import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useRegistration } from '../../contexts';
import ProfileImageModal from '../../component/ProfileImageModal';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../utils/permissions';
import { uploadService } from '../../services/api/upload.service';


const TOTAL_STEPS = 8; // ✅ Updated to 8 steps

const SKILLS_DATA = [
  'Vedic Astrology',
  'Numerology',
  'Tarot Reading',
  'Palmistry',
  'Vastu Shastra',
  'Face Reading',
  'KP Astrology',
  'Nadi Astrology',
  'Horoscope Reading',
  'Kundli Making',
  'Prashna Kundali',
  'Muhurat',
];

export default function RegistrationFormScreen({ navigation }) {
  const { saveRegistrationData, submitRegistration, state } = useRegistration();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    dateOfBirth: null,
    gender: 'null',
    bio: '',
    skills: [],
    languages: { Hindi: false, English: false, Marathi: false, Other: false }, // ✅ Changed structure
    phoneModel: '', 
    profilePicture: null, 
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // ============= Helper Functions =============

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ✅ Updated to work with object structure
  const toggleLanguage = lang => {
    setForm(prev => ({
      ...prev,
      languages: { ...prev.languages, [lang]: !prev.languages[lang] },
    }));
  };

  const toggleSkill = skill => {
    const current = form.skills || [];
    if (current.includes(skill)) {
      updateField('skills', current.filter(s => s !== skill));
    } else {
      updateField('skills', [...current, skill]);
    }
  };

  function onChangeDate(event, selectedDate) {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('dateOfBirth', selectedDate.toISOString().split('T')[0]);
    }
  }

  // ============= Camera/Gallery Functions =============

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    launchCamera(
      { mediaType: 'photo', cameraType: 'front', saveToPhotos: true },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Camera error: ' + response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          updateField('profilePicture', response.assets[0].uri);
        }
      },
    );
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Gallery error: ' + response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        updateField('profilePicture', response.assets[0].uri);
      }
    });
  };

  // ============= Validation =============

  function validateEmail(mail) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(mail).toLowerCase());
  }

  function isStepValid() {
    switch (step) {
      case 1:
        return form.name.trim().length > 0;
      case 2:
        return !!form.dateOfBirth;
      case 3:
        return form.gender && form.gender !== 'null';
      case 4:
        return Object.values(form.languages).some(v => v); // ✅ At least one language
      case 5:
        return form.skills.length > 0;
      case 6:
        return !!form.phoneModel; // ✅ Phone model required
      case 7:
        return form.email === '' || validateEmail(form.email);
      case 8:
        return !!form.profilePicture; // ✅ Profile picture required
      default:
        return false;
    }
  }

  // ============= Navigation =============

async function next() {
  if (!isStepValid()) {
    Alert.alert('Validation', 'Please complete the current step');
    return;
  }

  if (step < TOTAL_STEPS) {
    const cleanData = JSON.parse(JSON.stringify(form));
    await saveRegistrationData(cleanData);
    
    setStep(s => s + 1);
    if (step + 1 === 2) setShowDatePicker(true);
  } else {
    try {
      console.log('🔵 Form data before conversion:', form);

      // ✅ Show loading for image upload
      if (form.profilePicture && form.profilePicture.startsWith('file://')) {
        Alert.alert('Uploading', 'Please wait while we upload your profile picture...');
      }

      const languagesObj = form.languages || {};
      const selectedLanguages = Object.keys(languagesObj).filter(
        lang => languagesObj[lang] === true
      );

      // ✅ Upload profile picture if it's a local file
      let profilePictureUrl = form.profilePicture;
      
      if (form.profilePicture && form.profilePicture.startsWith('file://')) {
        console.log('📤 Uploading profile picture...');
        
        try {
          const uploadResult = await uploadService.uploadImage(form.profilePicture);
          profilePictureUrl = uploadResult.url;
          console.log('✅ Profile picture uploaded:', profilePictureUrl);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          Alert.alert(
            'Upload Failed',
            'Failed to upload profile picture. Please try again.',
            [{ text: 'OK' }]
          );
          return; // Stop submission
        }
      }

      const finalData = {
        name: String(form.name || ''),
        email: String(form.email || ''),
        dateOfBirth: String(form.dateOfBirth || ''),
        gender: String(form.gender || ''),
        bio: String(form.bio || ''),
        skills: form.skills ? [...form.skills] : [],
        languagesKnown: selectedLanguages,
        profilePicture: profilePictureUrl, // ✅ Use uploaded URL
      };

      console.log('📤 Final data to save:', finalData);

      await saveRegistrationData(finalData);
      await submitRegistration();

      navigation.replace('ThankYou');
    } catch (error) {
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
}

  function prev() {
    if (step > 1) setStep(s => s - 1);
  }

  // ============= Step Indicator =============

  function StepIndicator() {
    const items = Array.from({ length: TOTAL_STEPS }).map((_, i) => i + 1);
    const connectorWidths = [18, 18, 18, 18, 18, 18, 18]; // ✅ 7 connectors for 8 steps

    return (
      <View style={styles.stepRow}>
        {items.map((num, i) => {
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

              {i !== items.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      width: connectorWidths[i] ?? 18,
                      backgroundColor: i < step - 1 ? '#5b2b84' : '#efe6fb',
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  // ============= Step Content Renderer =============

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Name (नाम)</Text>
            <TextInput
              style={styles.input}
              placeholder="Please enter your name here"
              value={form.name}
              onChangeText={t => updateField('name', t)}
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
            >
              <Text style={{ color: form.dateOfBirth ? '#111' : '#888' }}>
                {form.dateOfBirth
                  ? new Date(form.dateOfBirth).toLocaleDateString()
                  : 'Select date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <View style={{ marginTop: 10 }}>
                <DateTimePicker
                  value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date(1990, 0, 1)}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={onChangeDate}
                  themeVariant="light"
                />
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.label}>Gender (लिंग)</Text>
            <View style={{ marginTop: 8 }}>
              {['male', 'female', 'other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioRow}
                  onPress={() => updateField('gender', g)}
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
            <Text style={styles.label}>Language (भाषा)</Text>
            <View style={{ marginTop: 8 }}>
              {Object.keys(form.languages).map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => toggleLanguage(l)}
                  style={[
                    styles.langBtn,
                    form.languages[l] && styles.langBtnActive,
                  ]}
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
            <Text style={styles.label}>Skill (कोशल)</Text>
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
                  >
                    <Text style={[styles.symbol, selected && { color: '#fff' }]}>
                      {selected ? '✓ ' : '+ '}
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
            <Text style={styles.label}>Email Address (ई-मेल पता)</Text>
            <TextInput
              placeholder="Please enter your Email here"
              value={form.email}
              onChangeText={t => updateField('email', t)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.labelProfile}>Profile Pic (प्रोफाइल फोटो)</Text>

            {/* Profile Section */}
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

              {/* Camera Button */}
              <TouchableOpacity
                style={styles.cameraContainer}
                onPress={() => setShowImageModal(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/camera.png')}
                  style={styles.cameraIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Instruction Text */}
            <View style={{ marginTop: 40 }}>
              <Text style={{ marginTop: 10, color: 'green', textAlign: 'center' }}>
                Make sure your profile picture has your face in the center and
                is clearly visible for best impression.
              </Text>
            </View>

            {/* Profile Image Modal */}
            <ProfileImageModal
              visible={showImageModal}
              onClose={() => setShowImageModal(false)}
              onTakePhoto={openCamera}
              onChooseGallery={openGallery}
              onRemovePhoto={() => {
                updateField('profilePicture', null);
                setShowImageModal(false);
              }}
              hasPhoto={!!form.profilePicture}
            />
          </View>
        );

      default:
        return null;
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Stepper */}
      <View style={styles.stepperWrap}>
        <StepIndicator />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.whitePanel}
        contentContainerStyle={styles.panelContent}
      >
        {renderStepContent()}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={prev}
          disabled={step === 1 || state.isLoading}
          style={[styles.prevBtn, (step === 1 || state.isLoading) && { opacity: 0.5 }]}
        >
          <Text style={styles.prevText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={next}
          disabled={!isStepValid() || state.isLoading}
          style={[
            styles.nextBtn,
            (!isStepValid() || state.isLoading) && { opacity: 0.5 },
          ]}
        >
          {state.isLoading && step === TOTAL_STEPS ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>
              {step === TOTAL_STEPS ? 'Submit' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5b2b84',
  },
  stepperWrap: {
    backgroundColor: '#5b2b84',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#efe6fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#ff9a2e',
  },
  stepDotDone: {
    backgroundColor: '#5b2b84',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepDotTextDone: {
    color: '#fff',
  },
  connector: {
    height: 2,
    marginHorizontal: 3,
  },
  whitePanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  panelContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  stepContent: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  labelProfile: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#5b2b84',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5b2b84',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  langBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#5b2b84',
  },
  langBtnText: {
    fontSize: 16,
    color: '#333',
  },
  langBtnTextActive: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  skillButtonSelected: {
    backgroundColor: '#5b2b84',
  },
  symbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  skillText: {
    fontSize: 14,
    color: '#333',
  },
  skillTextSelected: {
    color: '#fff',
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  phoneOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  phoneOptionSelected: {
    borderColor: '#5b2b84',
    backgroundColor: '#f5f0ff',
  },
  phoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#5b2b84',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraContainer: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5b2b84',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  prevBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  prevText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#5b2b84',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
