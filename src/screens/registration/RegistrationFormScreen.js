import React, { useState, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
  Vibration,
  Linking,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRegistration } from '../../contexts';
import ProfileImageModal from '../../component/ProfileImageModal';
import {
  requestAllMediaPermissions,
  checkMediaPermissions,
} from '../../utils/permissions';
import { uploadService } from '../../services/api/upload.service';
import { styles } from '../../style/RegistrationFormStyle'; 
import ScreenWrapper from '../../component/ScreenWrapper';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 8;

const SKILLS_DATA = [
  'Vedic', 'Numerology', 'Tarot', 'Palmistry', 'Vastu', 
  'Face Reading', 'KP', 'Nadi', 'Horoscope', 'Kundli', 
  'Prashna', 'Muhurat', 'Life Coach', 'Psychic'
];

const LANGUAGES_DATA = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Other'];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  dateOfBirth: null,
  gender: '',
  bio: '',
  skills: [],
  languages: [],
  phoneModel: '',
  profilePicture: null,
};

export default function RegistrationFormScreen({ navigation, route }) {
  const { saveRegistrationData, submitRegistration, state } = useRegistration();
  // Fallback to state if route params are missing
  const verifiedPhone = route?.params?.phone || state.phoneNumber;
  const verifiedCountryCode = route?.params?.countryCode || state.countryCode;

  // ===== STATE =====
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ===== HANDLERS =====
  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSelection = useCallback((key, item) => {
    setForm(prev => {
      const current = prev[key] || [];
      const isSelected = current.includes(item);
      const newItems = isSelected
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [key]: newItems };
    });
    Vibration.vibrate(5);
  }, []);

  const onChangeDate = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('dateOfBirth', selectedDate.toISOString().split('T')[0]);
    }
  }, [updateField]);

  // ===== IMAGE PICKER =====
  const handleImagePick = async (type) => {
    setShowImageModal(false);
    const options = { mediaType: 'photo', quality: 0.7, selectionLimit: 1 };
    
    const callback = (res) => {
      if (res.assets?.[0]?.uri) {
        updateField('profilePicture', res.assets[0].uri);
      } else if (res.errorCode) {
        Alert.alert('Error', res.errorMessage);
      }
    };

    if (type === 'camera') launchCamera(options, callback);
    else launchImageLibrary(options, callback);
  };

  const checkPermissionsAndShowModal = async () => {
    if (Platform.OS === 'android') {
        setShowImageModal(true);
        return;
    }
    const status = await checkMediaPermissions();
    if (status.allGranted) {
      setShowImageModal(true);
    } else {
      const request = await requestAllMediaPermissions();
      if (request.camera || request.gallery) setShowImageModal(true);
      else Alert.alert('Permission Required', 'Please enable permissions in settings.');
    }
  };

  // ===== VALIDATION =====
  const isStepValid = useMemo(() => {
    switch (step) {
      case 1: return form.name.trim().length > 2;
      case 2: return !!form.dateOfBirth;
      case 3: return !!form.gender;
      case 4: return form.languages.length > 0;
      case 5: return form.skills.length > 0;
      case 6: return !!form.phoneModel;
      case 7: return !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      case 8: return !!form.profilePicture;
      default: return false;
    }
  }, [step, form]);

  // ===== NAVIGATION =====
  const handleNext = async () => {
    if (!isStepValid) return;

    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      // Final Submit
      try {
        setUploadingImage(true);
        let profilePictureUrl = form.profilePicture;

        // Upload Image if it's local
        if (form.profilePicture?.startsWith('file://')) {
          const uploadRes = await uploadService.uploadImage(form.profilePicture);
          profilePictureUrl = uploadRes.url;
        }

        // ✅ FIX: Map data to match Backend DTO structure
        const finalData = {
          phoneNumber: verifiedPhone,
          countryCode: verifiedCountryCode,
          name: form.name.trim(),
          email: form.email.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender.toLowerCase(), // ✅ FIX: Lowercase gender
          bio: form.bio.trim(),
          skills: form.skills,
          languagesKnown: form.languages, // ✅ FIX: Map 'languages' to 'languagesKnown'
          profilePicture: profilePictureUrl,
          phoneModel: form.phoneModel,
        };

        console.log("Submitting Data:", finalData); // Debug log

        await submitRegistration(finalData);
        navigation.replace('ThankYou');
      } catch (error) {
        console.error("Registration Error", error);
        const errMsg = error.response?.data?.message 
            ? (Array.isArray(error.response.data.message) ? error.response.data.message.join('\n') : error.response.data.message)
            : error.message;
        Alert.alert('Submission Failed', errMsg);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // ===== RENDERERS =====
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextRow}>
        <Text style={styles.stepTitle}>Step {step} of {TOTAL_STEPS}</Text>
        <Text style={styles.stepPercentage}>{Math.round((step / TOTAL_STEPS) * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 1: // Name
        return (
          <>
            <Text style={styles.heading}>What is your name?</Text>
            <Text style={styles.subHeading}>This will be displayed to users.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              placeholderTextColor="#999"
              value={form.name}
              onChangeText={t => updateField('name', t)}
              autoFocus
            />
          </>
        );
      case 2: // DOB
        return (
          <>
            <Text style={styles.heading}>When were you born?</Text>
            <Text style={styles.subHeading}>Used to calculate your astrological profile.</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
              <Text style={form.dateOfBirth ? styles.dateText : styles.placeholderText}>
                {form.dateOfBirth || 'DD / MM / YYYY'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date(1990, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
            )}
          </>
        );
      case 3: // Gender
        return (
          <>
            <Text style={styles.heading}>What is your gender?</Text>
            <View style={styles.selectionGrid}>
              {['Male', 'Female', 'Other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.card, form.gender === g && styles.cardActive]}
                  onPress={() => updateField('gender', g)}
                >
                  <Text style={[styles.cardText, form.gender === g && styles.cardTextActive]}>{g}</Text>
                  {form.gender === g && <Ionicons name="checkmark-circle" size={20} color="#372643" />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 4: // Languages
        return (
          <>
            <Text style={styles.heading}>Languages Spoken</Text>
            <Text style={styles.subHeading}>Select at least one language.</Text>
            <View style={styles.chipContainer}>
              {LANGUAGES_DATA.map(lang => {
                const isActive = form.languages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleSelection('languages', lang)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 5: // Skills
        return (
          <>
            <Text style={styles.heading}>Your Expertise</Text>
            <Text style={styles.subHeading}>Select your primary skills.</Text>
            <View style={styles.chipContainer}>
              {SKILLS_DATA.map(skill => {
                const isActive = form.skills.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => toggleSelection('skills', skill)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{skill}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 6: // Phone
        return (
          <>
            <Text style={styles.heading}>Device Information</Text>
            <Text style={styles.subHeading}>Which device do you use for consultations?</Text>
            <View style={styles.selectionGrid}>
              {['Android', 'iPhone'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.card, form.phoneModel === p && styles.cardActive]}
                  onPress={() => updateField('phoneModel', p)}
                >
                  <Ionicons name={p === 'Android' ? 'logo-android' : 'logo-apple'} size={24} color={form.phoneModel === p ? '#372643' : '#666'} />
                  <Text style={[styles.cardText, form.phoneModel === p && styles.cardTextActive, { marginLeft: 10 }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 7: // Email
        return (
          <>
            <Text style={styles.heading}>Email Address</Text>
            <Text style={styles.subHeading}>For official communication (Optional).</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#999"
              value={form.email}
              onChangeText={t => updateField('email', t)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        );
      case 8: // Profile Pic
        return (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.heading}>Profile Picture</Text>
            <Text style={[styles.subHeading, { textAlign: 'center' }]}>
              Upload a professional photo. Face should be clearly visible.
            </Text>
            
            <TouchableOpacity onPress={checkPermissionsAndShowModal} style={styles.imageUploadBox}>
              {form.profilePicture ? (
                <Image source={{ uri: form.profilePicture }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera" size={40} color="#372643" />
                  <Text style={styles.uploadText}>Tap to Upload</Text>
                </View>
              )}
              {form.profilePicture && (
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={14} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      default: return null;
    }
  };

  return (
    <ScreenWrapper backgroundColor="#372643" barStyle="light-content">
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registration</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* Content Card */}
        <View style={styles.cardContainer}>
          {renderProgressBar()}
          
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.nextButton, !isStepValid && styles.disabledButton]} 
              onPress={handleNext}
              disabled={!isStepValid || uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {step === TOTAL_STEPS ? 'Submit Application' : 'Next'}
                </Text>
              )}
              {!uploadingImage && <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ProfileImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onTakePhoto={() => handleImagePick('camera')}
        onChooseGallery={() => handleImagePick('gallery')}
        onRemovePhoto={() => updateField('profilePicture', null)}
        hasPhoto={!!form.profilePicture}
      />
    </ScreenWrapper>
  );
}