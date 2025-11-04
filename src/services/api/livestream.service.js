import { apiClient } from './axios.instance';
import { API_ENDPOINTS } from '../../config/api.config';

class LivestreamService {
  /**
   * Helper: Extract error message
   */
  extractErrorMessage(error) {
    if (!error.response?.data) {
      return error.message || 'An error occurred';
    }

    const data = error.response.data;

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    if (typeof data.message === 'string') {
      return data.message;
    }

    return data.error || error.message || 'Request failed';
  }

  // ==================== STREAM MANAGEMENT ====================

  /**
   * Create stream
   */
  async createStream(data) {
    try {
      console.log('📤 Creating stream:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_CREATE_STREAM, data);
      
      console.log('✅ Stream created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create stream failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Get my streams
   */
  async getMyStreams(params = {}) {
    try {
      console.log('📤 Fetching my streams:', params);

      const response = await apiClient.get(API_ENDPOINTS.ASTROLOGER_MY_STREAMS, { params });
      
      console.log('✅ Streams fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Fetch streams failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Start stream (go live)
   */
  async startStream(streamId) {
    try {
      console.log('📤 Starting stream:', streamId);

      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_START_STREAM.replace(':streamId', streamId)
      );
      
      console.log('✅ Stream started:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Start stream failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * End stream
   */
  async endStream(streamId) {
    try {
      console.log('📤 Ending stream:', streamId);

      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_END_STREAM.replace(':streamId', streamId)
      );
      
      console.log('✅ Stream ended:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ End stream failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Update stream
   */
  async updateStream(streamId, data) {
    try {
      console.log('📤 Updating stream:', streamId, data);

      const response = await apiClient.patch(
        API_ENDPOINTS.ASTROLOGER_UPDATE_STREAM.replace(':streamId', streamId),
        data
      );
      
      console.log('✅ Stream updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update stream failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Delete stream
   */
  async deleteStream(streamId) {
    try {
      console.log('📤 Deleting stream:', streamId);

      const response = await apiClient.delete(
        API_ENDPOINTS.ASTROLOGER_DELETE_STREAM.replace(':streamId', streamId)
      );
      
      console.log('✅ Stream deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Delete stream failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  // ==================== STREAM CONTROLS ====================

  /**
   * Toggle microphone
   */
  async toggleMic(streamId, enabled) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_TOGGLE_MIC.replace(':streamId', streamId),
        { enabled }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Toggle mic failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Toggle camera
   */
  async toggleCamera(streamId, enabled) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_TOGGLE_CAMERA.replace(':streamId', streamId),
        { enabled }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Toggle camera failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  // ==================== CALL MANAGEMENT ====================

  /**
   * Update call settings
   */
  async updateCallSettings(streamId, settings) {
    try {
      console.log('📤 Updating call settings:', streamId, settings);

      const response = await apiClient.patch(
        API_ENDPOINTS.ASTROLOGER_UPDATE_CALL_SETTINGS.replace(':streamId', streamId),
        settings
      );
      
      console.log('✅ Call settings updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update call settings failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Get call waitlist
   */
  async getCallWaitlist(streamId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ASTROLOGER_GET_WAITLIST.replace(':streamId', streamId)
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get waitlist failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Accept call request
   */
  async acceptCallRequest(streamId, userId) {
    try {
      console.log('📤 Accepting call request:', streamId, userId);

      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_ACCEPT_CALL
          .replace(':streamId', streamId)
          .replace(':userId', userId)
      );
      
      console.log('✅ Call accepted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Accept call failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Reject call request
   */
  async rejectCallRequest(streamId, userId) {
    try {
      console.log('📤 Rejecting call request:', streamId, userId);

      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_REJECT_CALL
          .replace(':streamId', streamId)
          .replace(':userId', userId)
      );
      
      console.log('✅ Call rejected:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Reject call failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * End current call
   */
  async endCurrentCall(streamId) {
    try {
      console.log('📤 Ending current call:', streamId);

      const response = await apiClient.post(
        API_ENDPOINTS.ASTROLOGER_END_CALL.replace(':streamId', streamId)
      );
      
      console.log('✅ Call ended:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ End call failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get stream analytics
   */
  async getStreamAnalytics(streamId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ASTROLOGER_STREAM_ANALYTICS.replace(':streamId', streamId)
      );
      return response.data;
    } catch (error) {
      console.error('❌ Get analytics failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Get host analytics summary
   */
  async getHostAnalytics() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASTROLOGER_HOST_ANALYTICS);
      return response.data;
    } catch (error) {
      console.error('❌ Get host analytics failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  async deleteStream(streamId) {
  try {
    console.log('🗑️ Deleting stream:', streamId);
    const response = await api.delete(`/astrologer/streams/${streamId}`);
    console.log('✅ Stream deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Delete stream failed:', error.response?.data || error.message);
    throw error;
  }
}

}

export const livestreamService = new LivestreamService();
