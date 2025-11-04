export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@vaidik_access_token',
  REFRESH_TOKEN: '@vaidik_refresh_token',
  USER_DATA: '@vaidik_user_data',
  ASTROLOGER_DATA: '@vaidik_astrologer_data',
  REGISTRATION_DATA: '@vaidik_registration_data',
  PHONE_NUMBER: '@vaidik_phone_number',
  TICKET_NUMBER: '@vaidik_ticket_number',
};

export const OTP_CONFIG = {
  LENGTH: 6,
  RESEND_TIMEOUT: 30, // seconds
  EXPIRY_TIME: 5, // minutes
};

export const REGISTRATION_STATUS = {
  WAITLIST: 'waitlist',
  INTERVIEW_ROUND_1: 'interview_round_1',
  INTERVIEW_ROUND_2: 'interview_round_2',
  INTERVIEW_ROUND_3: 'interview_round_3',
  INTERVIEW_ROUND_4: 'interview_round_4',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const REGISTRATION_STEPS = {
  PHONE_NUMBER: 1,
  OTP_VERIFICATION: 2,
  BASIC_INFO: 3,
  DOCUMENTS: 4,
  SUCCESS: 5,
};

export const GIFT_TYPES = {
  ROSE: { name: 'Rose', emoji: '🌹', price: 10 },
  HEART: { name: 'Heart', emoji: '❤️', price: 50 },
  DIAMOND: { name: 'Diamond', emoji: '💎', price: 100 },
  CROWN: { name: 'Crown', emoji: '👑', price: 200 },
  TROPHY: { name: 'Trophy', emoji: '🏆', price: 500 },
};

export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video',
};

export const CALL_MODES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

export const STREAM_STATES = {
  STREAMING: 'streaming',
  ON_CALL: 'on_call',
  IDLE: 'idle',
};