/**
 * Backend and API configuration derived from environment variables
 */

import { env } from './env';

export const API_BASE_URL = env.API_BASE_URL;
export const WORKER_API_BASE_URL = env.WORKER_API_BASE_URL;
export const USER_BASE_URL = env.USER_BASE_URL;
export const ADMIN_BASE_URL = env.ADMIN_BASE_URL;

export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout', 
  me: '/api/me',
  signup: '/api/auth/signup'
} as const;

export const CHAT_ENDPOINTS = {
  chat: '/api/chat',
  models: '/api/models',
  history: '/api/chat/history'
} as const;

export const FAMILY_ENDPOINTS = {
  overview: '/api/family',
  child: (childId: string) => `/api/family/children/${childId}`,
  requests: '/api/family/requests',
  request: (requestId: string) => `/api/family/requests/${requestId}`,
} as const;

export const ADMIN_ENDPOINTS = {
  providers: '/api/admin/providers',
  models: '/api/admin/models',
  audit: '/api/admin/audit',
  health: '/api/admin/health',
  users: '/api/admin/users',
  settings: '/api/admin/settings'
} as const;

/**
 * Request timeout configuration
 */
export const TIMEOUTS = {
  default: 15000, // 15 seconds
  chat: 60000,    // 1 minute for chat responses
  upload: 300000  // 5 minutes for file uploads
} as const;

/**
 * Request retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    return error.response?.status >= 500 || !error.response;
  }
} as const;