import { apiClient } from './axios.instance';
import { API_ENDPOINTS } from '../../config/api.config';

class RegistrationService {
  /**
   * Helper: Extract error message from response
   */
  extractErrorMessage(error) {
    if (!error.response?.data) {
      return error.message || 'An error occurred';
    }

    const data = error.response.data;

    // ✅ Handle array of messages
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    // ✅ Handle nested validation errors
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(e => e.message || e).join(', ');
    }

    // ✅ Handle string message
    if (typeof data.message === 'string') {
      return data.message;
    }

    // ✅ Fallback
    return data.error || error.message || 'Registration failed';
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(data) {
    try {
      console.log('📤 Sending OTP Request:', {
        url: API_ENDPOINTS.SEND_OTP,
        data: data,
      });

      const response = await apiClient.post(API_ENDPOINTS.SEND_OTP, data);
      
      console.log('✅ OTP Response Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ OTP Request Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // ✅ Attach formatted error message
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(data) {
    try {
      console.log('📤 Verify OTP Request:', {
        url: API_ENDPOINTS.VERIFY_OTP,
        data: data,
      });

      const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, data);
      
      console.log('✅ Verify OTP Response Data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Verify OTP Request Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Register astrologer
   */
  async register(data) {
    try {
      console.log('📤 Register Request:', {
        url: API_ENDPOINTS.REGISTER,
        data: data,
      });

      const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
      
      console.log('✅ Register Response Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register Request Failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: data,
      });
      
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Check status by ticket number
   */
  async checkStatusByTicket(ticketNumber) {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.CHECK_STATUS_TICKET}/${ticketNumber}`
      );
      return response.data;
    } catch (error) {
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }

  /**
   * Check status by phone number
   */
  async checkStatusByPhone(phoneNumber, countryCode) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHECK_STATUS_PHONE, {
        params: { phoneNumber, countryCode },
      });
      return response.data;
    } catch (error) {
      error.formattedMessage = this.extractErrorMessage(error);
      throw error;
    }
  }
}

export const registrationService = new RegistrationService();
