import { http } from './http';
import { PaginatedResponse, Session } from './types';

export async function listSessions(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<Session>>('/admin/sessions', { params });
  return response.data;
}

export async function terminateSession(id: string) {
  return http.delete(`/admin/sessions/${id}`);
}
