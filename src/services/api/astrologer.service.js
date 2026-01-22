// src/services/astrologer.service.js

import { apiClient } from './axios.instance';

class AstrologerService {
  
  // ===== PROFILE MANAGEMENT =====

  /**
   * ✅ NEW: Get complete profile with ALL details
   * GET /astrologer/profile/complete
   */
  async getCompleteProfile() {
    try {
      console.log('📊 [AstrologerService] Fetching complete profile...');
      const response = await apiClient.get('/astrologer/profile/complete');
      console.log('✅ [AstrologerService] Complete profile fetched successfully');
      console.log('📋 [AstrologerService] Profile data:', {
        name: response.data.data?.name,
        email: response.data.data?.email,
        phone: response.data.data?.phoneNumber,
        experienceYears: response.data.data?.experienceYears,
        specializations: response.data.data?.specializations,
        languages: response.data.data?.languages,
      });
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Complete Profile Error:', error);
      this._handleError(error, 'Failed to fetch complete profile');
    }
  }

  /**
   * Get full profile with Stats, Earnings, and Availability
   * GET /astrologer/profile
   */
  async getProfile() {
    try {
      console.log('📊 [AstrologerService] Fetching profile...');
      const response = await apiClient.get('/astrologer/profile');
      console.log('✅ [AstrologerService] Profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Profile Error:', error);
      this._handleError(error, 'Failed to fetch profile');
    }
  }

  /**
   * Get profile completion status
   * GET /astrologer/profile/completion
   */
  async getProfileCompletion() {
    try {
      console.log('📋 [AstrologerService] Fetching profile completion...');
      const response = await apiClient.get('/astrologer/profile/completion');
      console.log('✅ [AstrologerService] Profile completion fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Profile Completion Error:', error);
      this._handleError(error, 'Failed to fetch profile completion');
    }
  }

  /**
   * Update profile (minor changes)
   * PATCH /astrologer/profile
   * @param {Object} profileData - { bio, profilePicture, chatRate, callRate, videoCallRate, isChatEnabled, isCallEnabled }
   */
  async updateProfile(profileData) {
    try {
      console.log('✏️ [AstrologerService] Updating profile...');
      const response = await apiClient.patch('/astrologer/profile', profileData);
      console.log('✅ [AstrologerService] Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Update Profile Error:', error);
      this._handleError(error, 'Failed to update profile');
    }
  }

  /**
   * Update pricing
   * PATCH /astrologer/profile/pricing
   * @param {Object} pricingData - { chat, call, videoCall }
   */
  async updatePricing(pricingData) {
    try {
      console.log('💰 [AstrologerService] Updating pricing...', pricingData);
      const response = await apiClient.patch('/astrologer/profile/pricing', pricingData);
      console.log('✅ [AstrologerService] Pricing updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Update Pricing Error:', error);
      this._handleError(error, 'Failed to update pricing');
    }
  }

  // ===== AVAILABILITY MANAGEMENT =====

  /**
   * Get availability/working hours
   * GET /astrologer/availability
   */
  async getAvailability() {
    try {
      console.log('⏰ [AstrologerService] Fetching availability...');
      const response = await apiClient.get('/astrologer/availability');
      console.log('✅ [AstrologerService] Availability fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Availability Error:', error);
      this._handleError(error, 'Failed to fetch availability');
    }
  }

  /**
   * Update working hours
   * PATCH /astrologer/profile/working-hours
   * @param {Object} workingHoursData - { workingHours: [{ day, slots: [{ start, end, isActive }] }] }
   */
  async updateWorkingHours(workingHoursData) {
    try {
      console.log('⏰ [AstrologerService] Updating working hours...');
      const response = await apiClient.patch('/astrologer/profile/working-hours', workingHoursData);
      console.log('✅ [AstrologerService] Working hours updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Update Working Hours Error:', error);
      this._handleError(error, 'Failed to update working hours');
    }
  }

  /**
   * Update availability status
   * PATCH /astrologer/availability
   * @param {Object} availabilityData - { isOnline, isAvailable, busyUntil }
   */
  async updateAvailability(availabilityData) {
    try {
      console.log('🔄 [AstrologerService] Updating availability status...');
      const response = await apiClient.patch('/astrologer/availability', availabilityData);
      console.log('✅ [AstrologerService] Availability status updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Update Availability Error:', error);
      this._handleError(error, 'Failed to update availability');
    }
  }

  /**
   * Toggle online status
   * POST /astrologer/status/online
   * @param {Boolean} isOnline - true for online, false for offline
   */
  async toggleOnlineStatus(isOnline) {
    try {
      console.log('🔄 [AstrologerService] Toggling online status to:', isOnline);
      
      const response = await apiClient.post('/astrologer/status/online', { 
        isOnline 
      });
      
      console.log('✅ [AstrologerService] Online status toggled successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Toggle Online Status Error:', error);
      this._handleError(error, 'Failed to update online status');
    }
  }

  /**
   * Toggle availability
   * POST /astrologer/status/available
   * @param {Boolean} isAvailable - true for available, false for busy
   */
  async toggleAvailability(isAvailable) {
    try {
      console.log('🔄 [AstrologerService] Toggling availability to:', isAvailable);
      
      const response = await apiClient.post('/astrologer/status/available', { 
        isAvailable 
      });
      
      console.log('✅ [AstrologerService] Availability toggled successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Toggle Availability Error:', error);
      this._handleError(error, 'Failed to update availability');
    }
  }


  // ===== PROFILE CHANGE REQUESTS =====

  /**
   * Request profile change (for major changes requiring admin approval)
   * POST /astrologer/profile/change-request
   * @param {Object} changeData - { changes: [{ field, currentValue, requestedValue, reason }] }
   */
  async requestProfileChange(changeData) {
    try {
      console.log('📝 [AstrologerService] Submitting profile change request...');
      const response = await apiClient.post('/astrologer/profile/change-request', changeData);
      console.log('✅ [AstrologerService] Profile change request submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Request Profile Change Error:', error);
      this._handleError(error, 'Failed to submit profile change request');
    }
  }

  /**
   * Get my change requests
   * GET /astrologer/profile/change-requests
   */
  async getMyChangeRequests() {
    try {
      console.log('📋 [AstrologerService] Fetching change requests...');
      const response = await apiClient.get('/astrologer/profile/change-requests');
      console.log('✅ [AstrologerService] Change requests fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Change Requests Error:', error);
      this._handleError(error, 'Failed to fetch change requests');
    }
  }

 // ===== EARNINGS =====

 /**
   * Get earnings summary
   * GET /astrologer/earnings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  async getEarnings(filters = {}) {
    try {
      console.log('💰 [AstrologerService] Fetching earnings with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get(`/astrologer/earnings?${params.toString()}`);
      console.log('✅ [AstrologerService] Earnings fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Earnings Error:', error);
      this._handleError(error, 'Failed to fetch earnings');
    }
  }

  /**
   * Get stats (separate from earnings)
   * GET /astrologer/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  async getStats(filters = {}) {
    try {
      console.log('📈 [AstrologerService] Fetching stats with filters:', filters);

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get(`/astrologer/stats?${params.toString()}`);
      console.log('✅ [AstrologerService] Stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Stats Error:', error);
      this._handleError(error, 'Failed to fetch stats');
    }
  }

  // ===== TRANSACTIONS =====

  /**
   * ✅ NEW: Get all transactions (calls, chats, gifts, streams)
   * GET /astrologer/transactions
   * @param {Object} filters - { page, limit, type, sessionType }
   */
  async getTransactions(filters = {}) {
    try {
      const { page = 1, limit = 20, type, sessionType } = filters;
      
      console.log('📊 [AstrologerService] Fetching transactions...', filters);
      
      const params = new URLSearchParams({ page, limit });
      if (type) params.append('type', type);
      if (sessionType) params.append('sessionType', sessionType);
      
      const response = await apiClient.get(`/astrologer/transactions?${params.toString()}`);
      console.log('✅ [AstrologerService] Transactions fetched successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Transactions Error:', error);
      this._handleError(error, 'Failed to fetch transactions');
    }
  }

 /**
   * Get transaction statistics breakdown
   * GET /astrologer/transactions/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  async getTransactionStats(filters = {}) {
    try {
      console.log('📈 [AstrologerService] Fetching transaction stats with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get(`/astrologer/transactions/stats?${params.toString()}`);
      console.log('✅ [AstrologerService] Transaction stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Transaction Stats Error:', error);
      this._handleError(error, 'Failed to fetch transaction stats');
    }
  }

  // ===== GIFTS (UPDATED) =====

  /**
   * Get gift history
   */
  async getGiftHistory(filters = {}) {
    try {
      const { page = 1, limit = 20, context, startDate, endDate } = filters;
      
      console.log('🎁 [AstrologerService] Fetching gift history...', filters);
      
      const params = new URLSearchParams({ page, limit });
      if (context) params.append('context', context);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiClient.get(`/astrologer/gifts/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Gift History Error:', error);
      this._handleError(error, 'Failed to fetch gift history');
    }
  }

  /**
   * Get gift statistics
   * GET /astrologer/gifts/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  async getGiftStats(filters = {}) {
    try {
      console.log('🎁 [AstrologerService] Fetching gift stats with filters:', filters);

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await apiClient.get(`/astrologer/gifts/stats?${params.toString()}`);
      console.log('✅ [AstrologerService] Gift stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Get Gift Stats Error:', error);
      this._handleError(error, 'Failed to fetch gift stats');
    }
  }

  // ===== ACCOUNT SETTINGS =====

  /**
   * Schedule account for deletion (7-day grace period)
   * DELETE /astrologer/account
   * @param {string} reason - Optional reason for deletion
   */
  async deleteAccount(reason = "") {
    try {
      console.log('⚠️ [AstrologerService] Requesting account deletion...');
      
      // We send the reason in the body (data property for DELETE requests in axios)
      const response = await apiClient.delete('/astrologer/account', {
        data: { reason }
      });
      
      console.log('✅ [AstrologerService] Account scheduled for deletion');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Delete Account Error:', error);
      this._handleError(error, 'Failed to delete account');
    }
  }

  // ==================== UGC (BLOCK & REPORT) ====================

  /**
   * Block a user (Stop receiving messages/calls from them)
   * POST /astrologer/block-user
   */
  async blockUser(userId) {
    try {
      console.log('🚫 [AstrologerService] Blocking user:', userId);
      // Ensure API_ENDPOINTS.ASTROLOGER_BLOCK_USER is defined in api.config.js
      // If not, use raw string: '/astrologer/block-user'
      const url = API_ENDPOINTS.ASTROLOGER_BLOCK_USER || '/astrologer/block-user';
      
      const response = await apiClient.post(url, { userId });
      console.log('✅ [AstrologerService] User blocked successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Block User Error:', error);
      this._handleError(error, 'Failed to block user');
    }
  }

  /**
   * Report a user for abuse/spam
   * POST /common/report
   */
  async reportUser(data) {
    // data = { reportedUserId, reason, entityType: 'chat'|'stream', entityId, description }
    try {
      console.log('🚩 [AstrologerService] Reporting user:', data);
      const url = API_ENDPOINTS.COMMON_REPORT_USER || '/common/report';
      
      const response = await apiClient.post(url, data);
      console.log('✅ [AstrologerService] Report submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [AstrologerService] Report Error:', error);
      this._handleError(error, 'Failed to submit report');
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Centralized error handler
   * @private
   */
  _handleError(error, defaultMessage) {
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      defaultMessage;
    
    const errorDetails = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };

    throw errorDetails;
  }
}

export const astrologerService = new AstrologerService();
export default astrologerService;