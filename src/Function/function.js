//   const openCamera = async () => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) {
//       showCustomToast('Camera permission denied');
//       return;
//     }

//     launchCamera(
//       { mediaType: 'photo', cameraType: 'front', saveToPhotos: true },
//       response => {
//         if (response.didCancel) return;
//         if (response.errorCode) {
//           showCustomToast('Camera error: ' + response.errorMessage);
//           return;
//         }
//         if (response.assets && response.assets[0]) {
//           updateField('profilePic', response.assets[0]);
//         }
//       },
//     );
//   };
