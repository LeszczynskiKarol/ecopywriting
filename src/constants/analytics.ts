// src/constants/analytics.ts
export const HEAP_EVENTS = {
  LOGIN: {
    START: 'login_start',
    SUCCESS: 'login_success',
    ERROR: 'login_error',
  },
  REGISTER: {
    START: 'register_start',
    SUCCESS: 'register_success',
    ERROR: 'register_error',
  },
} as const;
