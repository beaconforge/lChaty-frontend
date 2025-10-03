import { http } from './http';
import { AdminUser, PaginatedResponse } from './types';

export async function listUsers(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
  return response.data;
}

export async function getUser(id: string) {
  const response = await http.get<AdminUser>(`/admin/users/${id}`);
  return response.data;
}

export async function updateUser(id: string, payload: Partial<AdminUser>) {
  const response = await http.patch<AdminUser>(`/admin/users/${id}`, payload);
  return response.data;
}

export async function inviteUser(payload: { email: string; role: string; orgId?: string }) {
  const response = await http.post('/admin/users/invite', payload);
  return response.data;
}

export async function resetPassword(id: string) {
  return http.post(`/admin/users/${id}/reset-password`, {});
}
