import env from './env';

const API_BASE_URL = env.API_BASE_URL;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL ,
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Registration
  SEND_OTP: '/registration/otp/send',
  VERIFY_OTP: '/registration/otp/verify',
  REGISTER: '/registration/register',
  CHECK_STATUS_TICKET: '/registration/status/ticket',
  CHECK_STATUS_PHONE: '/registration/status/phone',

  UPLOAD_IMAGE: '/upload/image',
  
// Astrologer Auth
  ASTROLOGER_CHECK_PHONE: '/auth/astrologer/check-phone',
  ASTROLOGER_LOGIN: '/auth/astrologer/send-otp',
  ASTROLOGER_VERIFY_LOGIN: '/auth/astrologer/verify-otp',
  ASTROLOGER_REFRESH_TOKEN: '/auth/astrologer/refresh',
  ASTROLOGER_LOGOUT: '/auth/astrologer/logout',
  ASTROLOGER_ME: '/auth/astrologer/me',
  ASTROLOGER_TRUECALLER_LOGIN: '/auth/astrologer/verify-truecaller',
  
   // ==================== LIVESTREAM ENDPOINTS ====================
  
  // Stream Management
  ASTROLOGER_CREATE_STREAM: '/astrologer/streams',
  ASTROLOGER_MY_STREAMS: '/astrologer/streams',
  ASTROLOGER_START_STREAM: '/astrologer/streams/:streamId/start',
  ASTROLOGER_END_STREAM: '/astrologer/streams/:streamId/end',
  ASTROLOGER_UPDATE_STREAM: '/astrologer/streams/:streamId',
  ASTROLOGER_DELETE_STREAM: '/astrologer/streams/:streamId',

  // Stream Controls
  ASTROLOGER_TOGGLE_MIC: '/astrologer/streams/:streamId/controls/mic',
  ASTROLOGER_TOGGLE_CAMERA: '/astrologer/streams/:streamId/controls/camera',

  // Call Management
  ASTROLOGER_UPDATE_CALL_SETTINGS: '/astrologer/streams/:streamId/call-settings',
  ASTROLOGER_GET_WAITLIST: '/astrologer/streams/:streamId/waitlist',
  ASTROLOGER_ACCEPT_CALL: '/astrologer/streams/:streamId/waitlist/:userId/accept',
  ASTROLOGER_REJECT_CALL: '/astrologer/streams/:streamId/waitlist/:userId/reject',
  ASTROLOGER_END_CALL: '/astrologer/streams/:streamId/call/end',

  // Analytics
  ASTROLOGER_STREAM_ANALYTICS: '/astrologer/streams/:streamId/analytics',
  ASTROLOGER_HOST_ANALYTICS: '/astrologer/streams/analytics/summary',

  // ===== Chat (shared backend) =====
  CHAT_GET_MESSAGES: '/chat/sessions/:sessionId/messages',
  CHAT_END_SESSION: '/chat/sessions/end',

  // Astrologer chat actions
  ASTRO_CHAT_ACCEPT: '/chat/astrologer/accept',
  ASTRO_CHAT_REJECT: '/chat/astrologer/reject',

  // ===== Call (stub for later) =====
  ASTRO_CALL_ACCEPT: '/calls/astrologer/accept',
  ASTRO_CALL_REJECT: '/calls/astrologer/reject',
  ASTRO_CALL_END: '/calls/sessions/end',
};
