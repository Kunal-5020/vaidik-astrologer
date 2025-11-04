import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Request Camera Permission
 */
export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'VaidikTalk needs access to your camera to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // iOS
    const result = await check(PERMISSIONS.IOS.CAMERA);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    const requestResult = await request(PERMISSIONS.IOS.CAMERA);
    return requestResult === RESULTS.GRANTED;
  }
};

/**
 * Request Gallery Permission
 */
export const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      // Android 13+
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Gallery Permission',
            message: 'VaidikTalk needs access to your photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // Android 12 and below
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Gallery Permission',
            message: 'VaidikTalk needs access to your photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  } else {
    // iOS
    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return requestResult === RESULTS.GRANTED;
  }
};

/**
 * Request Location Permission
 */
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'VaidikTalk needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // iOS
    const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return requestResult === RESULTS.GRANTED;
  }
};

/**
 * Request Microphone Permission
 */
export const requestMicrophonePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'VaidikTalk needs access to your microphone',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // iOS
    const result = await check(PERMISSIONS.IOS.MICROPHONE);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
    return requestResult === RESULTS.GRANTED;
  }
};

export const requestCameraAndMicPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted = granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
      const micGranted = granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;

      if (cameraGranted && micGranted) {
        return true;
      } else {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required for livestreaming.',
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  } else {
    // iOS
    try {
      const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
      const micStatus = await request(PERMISSIONS.IOS.MICROPHONE);

      if (cameraStatus === RESULTS.GRANTED && micStatus === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required for livestreaming.',
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
};
