import { http } from './http';
import { AdminUser, normalizeAdminUser, RawAdminUser } from './types';

export async function login(username: string, password: string) {
  return http.post('/auth/login', { username, password });
}

export async function logout() {
  return http.post('/auth/logout');
}

export async function fetchMe(): Promise<AdminUser> {
  const response = await http.get<RawAdminUser>('/me');
  return normalizeAdminUser(response.data);
}
