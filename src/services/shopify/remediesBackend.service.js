// services/shopify/remediesBackend.service.js

// 1. Import the configured API client
import { apiClient } from '../api/axios.instance'; // Adjust path to where your axios instance is (e.g., '../config' or '../api/config')

class RemediesBackendService {
  
  // No need for getAuthToken() or getHeaders() 
  // because apiClient handles it.

 // ===== TAB 1: SUGGESTED REMEDIES =====
  async getSuggestedRemedies(page = 1, limit = 20) {
    try {
      const { data } = await apiClient.get(
        `/remedies/suggested?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      // ✅ Handle 404 specifically: Return empty list instead of throwing
      if (error.response && error.response.status === 404) {
        console.log('ℹ️ No suggested remedies found (404 handled)');
        return {
          success: true,
          data: {
            remedies: [],
            pagination: { page, limit, total: 0, pages: 0 }
          }
        };
      }
      
      console.error('Error fetching suggested remedies:', error);
      throw error;
    }
  }

  // ===== TAB 2: PURCHASED REMEDIES =====
  async getPurchasedRemedies(page = 1, limit = 20) {
    try {
      const { data } = await apiClient.get(
        `/remedies/purchased?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      // ✅ Handle 404 for purchased as well
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            remedies: [],
            pagination: { page, limit, total: 0, pages: 0 }
          }
        };
      }
      console.error('Error fetching purchased remedies:', error);
      throw error;
    }
  }

  // ===== TAB 3: ORDERS WITH REMEDIES =====
  async getOrdersWithRemedies() {
    try {
      const { data } = await apiClient.get(
        '/remedies/orders-with-remedies'
      );
      return data;
    } catch (error) {
      console.error('Error fetching orders with remedies:', error);
      throw error;
    }
  }

  // ===== REMEDIES BY ORDER =====
   async getRemediesByOrder(orderId, page = 1, limit = 20) {
    try {
      const { data } = await apiClient.get(
        `/remedies/by-order/${orderId}?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      // ✅ Handle 404 for order remedies
      if (error.response && error.response.status === 404) {
        return {
          success: true,
          data: {
            remedies: [],
            pagination: { page, limit, total: 0, pages: 0 }
          }
        };
      }
      console.error('Error fetching remedies by order:', error);
      throw error;
    }
  }


  // ===== UPDATE REMEDY STATUS =====
  async updateRemedyStatus(remedyId, status, notes = '') {
    try {
      const { data } = await apiClient.patch(
        `/remedies/${remedyId}/status`,
        { status, notes }
      );
      return data;
    } catch (error) {
      console.error('Error updating remedy status:', error);
      throw error;
    }
  }

  async suggestBulkRemedies(userId, orderId, products) {
  try {
    const response = await apiClient.post(
      `/astrologer/remedies/suggest-bulk/${userId}/${orderId}`,
      { products },
    );
    return response.data;
  } catch (error) {
    console.error('suggestBulkRemedies error:', error);
    throw error;
  }
}
}

export default new RemediesBackendService();
