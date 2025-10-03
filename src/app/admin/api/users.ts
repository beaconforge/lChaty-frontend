import { http } from './http';
import { AdminUser, normalizeAdminUser, PaginatedResponse, RawAdminUser } from './types';

type RawPaginatedAdminUsers = {
  data?: RawAdminUser[];
  results?: RawAdminUser[];
  items?: RawAdminUser[];
  total?: number;
  page?: number;
  limit?: number;
  per_page?: number;
};

export async function listUsers(params: Record<string, unknown>): Promise<PaginatedResponse<AdminUser>> {
  const response = await http.get<RawPaginatedAdminUsers>('/admin/users', { params });
  const payload = response.data ?? {};
  const records = payload.data ?? payload.results ?? payload.items ?? [];

  return {
    data: records.map(normalizeAdminUser),
    total: payload.total ?? records.length,
    page: payload.page ?? 0,
    limit: payload.limit ?? payload.per_page ?? records.length,
  };
}

export async function getUser(id: string): Promise<AdminUser> {
  const response = await http.get<RawAdminUser>(`/admin/users/${id}`);
  return normalizeAdminUser(response.data);
}

export async function updateUser(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
  const response = await http.patch<RawAdminUser>(`/admin/users/${id}`, payload);
  return normalizeAdminUser(response.data);
}

export async function inviteUser(payload: { email: string; role: string; orgId?: string }) {
  const response = await http.post('/admin/users/invite', payload);
  return response.data;
}

export async function resetPassword(id: string) {
  return http.post(`/admin/users/${id}/reset-password`, {});
}
