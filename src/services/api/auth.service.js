import { apiClient } from './axios.instance';
import { API_ENDPOINTS } from '../../config/api.config';

class AstrologerAuthService {
  /**
   * Helper: Extract error message from response
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

    return data.error || error.message || 'Authentication failed';
  }

  /**
   * Check if phone number has approved astrologer account
   */
  async checkPhone(data) {
    try {
      console.log('📤 Checking phone for astrologer account:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_CHECK_PHONE, data);
      
      console.log('✅ Check Phone Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Check Phone Failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Send OTP for astrologer login
   */
  async sendLoginOtp(data) {
    try {
      console.log('📤 Sending Astrologer Login OTP:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_LOGIN, data);
      
      console.log('✅ Astrologer Login OTP Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Astrologer Login OTP Failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Verify OTP and login astrologer
   */
  async verifyLoginOtp(data) {
    try {
      console.log('📤 Verifying Astrologer Login OTP:', data);

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_VERIFY_LOGIN, data);
      
      console.log('✅ Astrologer Login Verify Response:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from server');
      }

      const { tokens, user, astrologer } = response.data.data;

      if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        console.error('❌ Missing tokens in response:', response.data);
        throw new Error('Server did not return authentication tokens');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Astrologer Login Verify Failed:', error.response?.data);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Refresh astrologer token
   */
  async refreshToken(refreshToken) {
    try {
      console.log('🔄 Refreshing astrologer token');

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_REFRESH_TOKEN, {
        refreshToken,
      });
      
      console.log('✅ Token refreshed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Token Refresh Failed:', error);
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Logout astrologer
   */
  async logout() {
    try {
      console.log('🚪 Logging out astrologer');

      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_LOGOUT);
      
      console.log('✅ Logout successful');
      return response.data;
    } catch (error) {
      console.error('❌ Logout Failed:', error);
      throw error;
    }
  }

  /**
   * Get current astrologer info
   */
  async getCurrentAstrologer() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ASTROLOGER_ME);
      return response.data;
    } catch (error) {
      console.error('❌ Get Current Astrologer Failed:', error);
      throw error;
    }
  }
}

export const astrologerAuthService = new AstrologerAuthService();
  