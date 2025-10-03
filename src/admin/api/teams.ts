import { http } from './http';
import { PaginatedResponse } from './types';

type Team = {
  id: string;
  name: string;
  orgId: string;
  membersCount: number;
  createdAt: string;
};

export async function listTeams(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<Team>>('/admin/teams', { params });
  return response.data;
}

export async function getTeam(id: string) {
  const response = await http.get<Team>(`/admin/teams/${id}`);
  return response.data;
}

export async function updateTeam(id: string, payload: Partial<Team>) {
  const response = await http.patch<Team>(`/admin/teams/${id}`, payload);
  return response.data;
}

export async function createTeam(payload: Partial<Team>) {
  const response = await http.post<Team>('/admin/teams', payload);
  return response.data;
}

export async function deleteTeam(id: string) {
  return http.delete(`/admin/teams/${id}`);
}
