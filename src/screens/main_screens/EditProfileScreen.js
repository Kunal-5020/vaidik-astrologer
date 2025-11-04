import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ProfileImageModal from '../../component/ProfileImageModal';
import CustomToast from '../../component/CustomToast';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../component/AppPermission';

const EditProfileScreen = ({ navigation }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [dob, setDob] = useState(new Date('1990-05-15')); // default DOB

  // form state
  const [form, setForm] = useState({
    profilePic: null,
    name: 'Maya Sharma',
    email: 'maya.sharma@example.com',
    phone: '+91 9876543210',
    dob: '05/15/1990',
    experience: '10',
    qualification: 'PhD in Astrology, Certified Tarot Reader',
    certification: 'International Astrology Federation',
    specializations: {
      vedic: true,
      tarot: true,
      numerology: true,
      palmistry: false,
    },
    languages: {
      english: true,
      hindi: false,
      french: false,
    },
    professionalBio: '',
    chatRate: '',
    audioRate: '',
  });

  // When user selects date
  const onDOBChange = (event, selectedDate) => {
    setShowDOBPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      // Format date as mm/dd/yyyy
      const formatted = `${
        selectedDate.getMonth() + 1
      }/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
      updateField('dob', formatted);
    }
  };

  // update field
  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // toggle checkboxes
  const toggleCheckbox = (category, key) => {
    setForm(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] },
    }));
  };

  // show toast
  const showCustomToast = message => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // camera & gallery
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showCustomToast('Camera permission denied');
      return;
    }
    launchCamera(
      { mediaType: 'photo', cameraType: 'front', saveToPhotos: true },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showCustomToast('Camera error: ' + response.errorMessage);
          return;
        }
        if (response.assets?.[0]) {
          updateField('profilePic', response.assets[0]);
          setShowImageModal(false);
        }
      },
    );
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      showCustomToast('Gallery permission denied');
      return;
    }
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        showCustomToast('Gallery error: ' + response.errorMessage);
        return;
      }
      if (response.assets?.[0]) {
        updateField('profilePic', response.assets[0]);
        setShowImageModal(false);
      }
    });
  };

  // handle bio length
  const handleBioChange = text => {
    if (text.length > 250) {
      Alert.alert(
        'Validation',
        'Professional Bio cannot exceed 250 characters',
      );
      return;
    }
    updateField('professionalBio', text);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back.png')}
            style={styles.leftIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.line} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Image */}
        <View style={styles.profileWrapper}>
          <View style={styles.profileContainer}>
            <Image
              source={
                form.profilePic
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
            <Image
              source={require('../../assets/camera.png')}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.inputField}
          value={form.name}
          onChangeText={text => updateField('name', text)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inputField}
          value={form.email}
          onChangeText={text => updateField('email', text)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.inputField}
          value={form.phone}
          onChangeText={text => updateField('phone', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Date of Birth</Text>

        <TouchableOpacity
          style={styles.dobInputContainer}
          onPress={() => setShowDOBPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={{ color: form.dob ? '#000' : '#999', fontSize: 15 }}>
            {form.dob || 'Select Date of Birth'}
          </Text>
          <Ionicons name="calendar-outline" size={22} color="#372643" />
        </TouchableOpacity>

        {showDOBPicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onDOBChange}
          />
        )}

        {/* Professional Details */}
        <Text style={styles.sectionTitle}>Professional Details</Text>

        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          style={styles.inputField}
          value={form.experience}
          onChangeText={text => updateField('experience', text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Qualifications</Text>
        <TextInput
          style={styles.inputField}
          value={form.qualification}
          onChangeText={text => updateField('qualification', text)}
        />

        <Text style={styles.label}>Certifications</Text>
        <TextInput
          style={styles.inputField}
          value={form.certification}
          onChangeText={text => updateField('certification', text)}
        />

        {/* Specializations */}
        <Text style={styles.label}>Specializations</Text>
        {Object.keys(form.specializations).map(key => (
          <View style={styles.checkboxRow} key={key}>
            <TouchableOpacity
              onPress={() => toggleCheckbox('specializations', key)}
            >
              <View
                style={
                  form.specializations[key] ? styles.checked : styles.unchecked
                }
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
        ))}

        {/* Languages */}
        <Text style={styles.label}>Languages</Text>
        {Object.keys(form.languages).map(key => (
          <View style={styles.checkboxRow} key={key}>
            <TouchableOpacity onPress={() => toggleCheckbox('languages', key)}>
              <View
                style={form.languages[key] ? styles.checked : styles.unchecked}
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
        ))}

        {/* Professional Bio */}
        <Text style={styles.label}>Professional Bio (max 250 chars)</Text>
        <TextInput
          style={[styles.inputField, { height: 100 }]}
          multiline
          maxLength={250}
          value={form.professionalBio}
          onChangeText={handleBioChange}
        />

        {/* Pricing */}
        <Text style={styles.label}>Pricing</Text>
        <Text style={styles.label}>Chat Rate (per minute)</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter rate"
          value={form.chatRate}
          onChangeText={text => updateField('chatRate', text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Audio Call Rate (per minute)</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter Rate"
          value={form.audioRate}
          onChangeText={text => updateField('audioRate', text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Video Call Rate (per minute)</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Audio Call Rate"
          value={form.audioRate}
          onChangeText={text => updateField('audioRate', text)}
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Save Changes Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ProfileImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onTakePhoto={openCamera}
        onChooseGallery={openGallery}
        onRemovePhoto={() => {
          updateField('profilePic', null);
          setShowImageModal(false);
        }}
        hasPhoto={!!form.profilePic}
      />

      {/* Toast */}
      {showToast && <CustomToast message={toastMessage} />}
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 0 : 0, // iOS SafeAreaView handles top inset
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 60 : 55,
    backgroundColor: '#372643',
    paddingHorizontal: '5%',
  },

  leftIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },

  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 20,
  },

  line: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
  },

  profileWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },

  profileContainer: {
    width: '38%',
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#372643',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  cameraContainer: {
    position: 'absolute',
    bottom: 15,
    right: '32%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Platform.OS === 'ios' ? 5 : 6,
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.15,
    shadowRadius: 2,
  },

  cameraIcon: {
    width: 22,
    height: 22,
    tintColor: '#000',
  },

  scroll: {
    paddingHorizontal: '5%',
    paddingBottom: Platform.OS === 'ios' ? 80 : 60,
  },

  sectionTitle: {
    color: 'grey',
    marginTop: 18,
    marginBottom: 9,
    fontSize: 17,
    fontWeight: 'bold',
  },

  label: {
    color: '#000',
    fontSize: 15,
    marginTop: 14,
    marginBottom: 3,
    fontWeight: 'bold',
  },

  inputField: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: '4%',
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    width: '100%',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  checked: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
    marginRight: 8,
  },

  unchecked: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6C63FF',
    marginRight: 8,
  },

  checkboxLabel: {
    fontSize: 15,
    color: '#333',
    flexShrink: 1,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: '5%',
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 12,
    marginRight: '3%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: 3,
  },

  cancelText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#FF9933', // Bhagwa color
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.2,
    shadowRadius: 4,
  },

  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dobInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: '5%',
    marginBottom: 8,
    width: '100%',
  },
});
