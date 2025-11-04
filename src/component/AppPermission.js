// components/AppPermissions.js
import { Platform, Linking } from 'react-native';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';

/**
 * CAMERA PERMISSION — Works on Android & iOS
 */
export async function requestCameraPermission() {
  try {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    let status = await check(permission);

    // ✅ If already granted, return
    if (status === RESULTS.GRANTED) return true;

    // 🔁 Ask permission
    const result = await request(permission);

    // ✅ On iOS, treat LIMITED as success too
    if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return true;

    // ❌ If denied or blocked
    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      console.warn('Camera permission denied or blocked');
      return false;
    }

    return false;
  } catch (error) {
    console.warn('Camera permission error:', error);
    return false;
  }
}

/**
 * GALLERY PERMISSION — Works Android (all versions) & iOS
 */
export async function requestGalleryPermission() {
  try {
    let permission;

    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version;

      if (androidVersion >= 33) {
        // ✅ Android 13+ uses new scoped permissions
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        // ✅ Older Android versions
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
    } else {
      // ✅ iOS — can return GRANTED or LIMITED
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    }

    let status = await check(permission);

    // ✅ Already allowed
    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      return true;
    }

    // 🔁 Request permission
    const result = await request(permission);

    // ✅ Handle both granted & limited access
    if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
      return true;
    }

    // ❌ Denied or blocked
    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      console.warn('Gallery permission denied or blocked');
      return false;
    }

    return false;
  } catch (error) {
    console.warn('Gallery permission error:', error);
    return false;
  }
}


 export async function requestCameraAndMic() {
  try {
    const cameraPermission = await request(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
    );
    const micPermission = await request(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO
    );

    if (cameraPermission === RESULTS.GRANTED && micPermission === RESULTS.GRANTED) {
      console.log('Camera and mic permissions granted');
      return true;
    } else {
      console.log('Permissions denied');
      return false;
    }
  } catch (error) {
    console.warn(error);
    return false;
  }
}
