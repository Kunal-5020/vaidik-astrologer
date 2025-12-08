import { apiClient } from '../axios.instance';
import { API_ENDPOINTS } from '../../../config/api.config';

export const CallService = {
  async acceptCall(sessionId) {
    const res = await apiClient.post(API_ENDPOINTS.ASTRO_CALL_ACCEPT, { sessionId });
    return res.data;
  },

  async rejectCall(sessionId, reason = 'busy') {
    const res = await apiClient.post(API_ENDPOINTS.ASTRO_CALL_REJECT, { sessionId, reason });
    return res.data;
  },

  async endCall(sessionId, reason = 'astrologer_ended') {
    const res = await apiClient.post(API_ENDPOINTS.ASTRO_CALL_END, { sessionId, reason });
    return res.data;
  },
};

export default CallService;
