import http from './http'
import { AUTH_ENDPOINTS, CHAT_ENDPOINTS } from '../config/backend'

export async function getMe() {
  const r = await http.get(AUTH_ENDPOINTS.me)
  return r.data
}

export async function login(payload: { username: string; password: string }) {
  const r = await http.post(AUTH_ENDPOINTS.login, payload)
  return r.data
}

export async function logout() {
  const r = await http.post(AUTH_ENDPOINTS.logout)
  return r.data
}

export async function sendChat(message: { text: string }) {
  const r = await http.post(CHAT_ENDPOINTS.chat, message)
  return r.data
}
