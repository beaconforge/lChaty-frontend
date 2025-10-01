// In development we want the browser to call the local Vite server at /api
// so Vite's proxy (configured in vite.config.ts) forwards requests to
// the worker/backend. Using a relative base prevents CORS during local dev.
// For production or explicit backend override, set VITE_API_BASE_URL.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || ''

export const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  me: '/api/me',
  signup: '/api/auth/signup'
}

export const CHAT_ENDPOINTS = {
  chat: '/api/chat'
}
