import { apiClient } from './axios.instance';

export const orderService = {
    /**
   * Get order details
   * API: GET /orders/:orderId
   */
  getOrderDetails: async (orderId) => {
    try {
      console.log('📡 Fetching order details:', orderId);

      const response = await apiClient.get(`/orders/astrologer/${orderId}`);

      if (response.data.success) {
        console.log('✅ Order details fetched');
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || 'Failed to fetch order details');
    } catch (error) {
      console.error('❌ Get order details error:', error);
      throw error;
    }
  },
    
}

export default orderService;