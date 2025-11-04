import { apiClient } from './axios.instance';

class UploadService {
  /**
   * Upload image to server (Mock version - returns static URL)
   * @param {string} uri - Local file URI from image picker
   * @param {string} type - File type (image/jpeg, image/png)
   * @returns {Promise<{url: string, s3Key: string}>}
   */
  async uploadImage(uri, type = 'image/jpeg') {
    try {
      console.log('📤 Uploading image:', uri);

      // Create FormData
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : type;

      formData.append('file', {
        uri: uri,
        type: fileType,
        name: filename || `photo_${Date.now()}.jpg`,
      });

      // Upload to server
      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for image upload
      });

      console.log('✅ Upload Response:', response.data);

      if (response.data.success) {
        return {
          url: response.data.data.url,
          s3Key: response.data.data.s3Key || response.data.data.key,
        };
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Image Upload Failed:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(uris) {
    try {
      const uploads = uris.map(uri => this.uploadImage(uri));
      return await Promise.all(uploads);
    } catch (error) {
      console.error('❌ Multiple Upload Failed:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
