import { apiClient } from './axios.instance'; // Adjust path as needed

class AstrologerReviewService {
  /**
   * Get reviews for a specific astrologer
   * Endpoint: GET /astrologers/:astrologerId/reviews
   */
  async getMyReviews(astrologerId, page = 1, limit = 20) {
    try {
      const response = await apiClient.get(
        `/astrologers/${astrologerId}/reviews?page=${page}&limit=${limit}`
      );
      return response.data; // Expected: { reviews: [], pagination: {} }
    } catch (error) {
      console.error('Get astrologer reviews error:', error);
      throw error;
    }
  }

  /**
   * Get review summary statistics
   * Endpoint: GET /astrologers/:astrologerId/reviews/stats
   */
  async getStats(astrologerId) {
    try {
      const response = await apiClient.get(`/astrologers/${astrologerId}/reviews/stats`);
      return response.data; // Expected: { averageRating, totalReviews, ... }
    } catch (error) {
      console.error('Get stats error:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }
}

export default new AstrologerReviewService();