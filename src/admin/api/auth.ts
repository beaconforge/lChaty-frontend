import { http } from './http';
import { AdminUser } from './types';

export async function login(username: string, password: string) {
  return http.post('/auth/login', { username, password });
}

export async function logout() {
  return http.post('/auth/logout');
}

export async function fetchMe() {
  const response = await http.get<AdminUser>('/me');
  return response.data;
}
