// src/services/livestream.service.js

import { apiClient } from './axios.instance';
// Assuming you have these constants or replace them with raw strings
import { API_ENDPOINTS } from '../../config/api.config'; 

class LivestreamService {
  
  extractErrorMessage(error) {
    if (!error.response?.data) return error.message || 'An error occurred';
    const data = error.response.data;
    if (Array.isArray(data.message)) return data.message.join(', ');
    return data.message || data.error || 'Request failed';
  }

  // ==================== STREAM MANAGEMENT ====================

  /**
   * ✅ NEW: Instant Go Live
   * Replaces createStream + startStream
   */
  async goLive(data) {
    try {
      console.log('cat Creating stream (Go Live):', data);
      // POST /astrologer/streams/go-live
      const response = await apiClient.post('/astrologer/streams/go-live', data);
      
      console.log('✅ You are live:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Go Live failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  async getMyStreams(params = {}) {
    try {
      const response = await apiClient.get('/astrologer/streams', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Fetch streams failed:', error.response?.data);
      throw error;
    }
  }

  async endStream(streamId) {
    try {
      console.log('📤 Ending stream:', streamId);
      const response = await apiClient.post(`/astrologer/streams/${streamId}/end`);
      console.log('✅ Stream ended:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ End stream failed:', error.response?.data);
      throw error;
    }
  }

  // ==================== CALL MANAGEMENT ====================

  async updateCallSettings(streamId, settings) {
    try {
      const response = await apiClient.patch(
        `/astrologer/streams/${streamId}/call-settings`,
        settings
      );
      return response.data;
    } catch (error) {
      console.error('❌ Update settings failed:', error);
      throw error;
    }
  }

  async getCallWaitlist(streamId) {
    try {
      const response = await apiClient.get(`/astrologer/streams/${streamId}/waitlist`);
      return response.data;
    } catch (error) {
      console.error('❌ Get waitlist failed:', error);
      throw error;
    }
  }

  async acceptCallRequest(streamId, userId) {
    try {
      console.log('📤 Accepting call:', userId);
      const response = await apiClient.post(
        `/astrologer/streams/${streamId}/waitlist/${userId}/accept`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Accept call failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  async rejectCallRequest(streamId, userId) {
    try {
      console.log('📤 Rejecting call:', userId);
      const response = await apiClient.post(
        `/astrologer/streams/${streamId}/waitlist/${userId}/reject`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Reject call failed:', error);
      throw error;
    }
  }

  async endCurrentCall(streamId) {
    try {
      console.log('📤 Ending call for stream:', streamId);
      const response = await apiClient.post(`/astrologer/streams/${streamId}/call/end`);
      return response.data;
    } catch (error) {
      console.error('❌ End call failed:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  async getStreamAnalytics(streamId) {
    try {
      const response = await apiClient.get(`/astrologer/streams/${streamId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('❌ Get analytics failed:', error);
      throw error;
    }
  }

  // ==================== CONTROLS (Client-Side Only Now) ====================
  
  // NOTE: The backend no longer has toggleMic/Camera endpoints because
  // Agora handles this on the client. We keep these methods empty or remove them
  // to prevent errors if UI calls them, but mostly the UI should just update local state.
  async toggleMic(streamId, enabled) { return { success: true }; }
  async toggleCamera(streamId, enabled) { return { success: true }; }
}

export const livestreamService = new LivestreamService();