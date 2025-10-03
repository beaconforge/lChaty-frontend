import { http } from './http';
import { PaginatedResponse } from './types';

type Org = {
  id: string;
  name: string;
  domain?: string;
  createdAt: string;
  ownerId?: string;
};

export async function listOrgs(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<Org>>('/admin/orgs', { params });
  return response.data;
}

export async function getOrg(id: string) {
  const response = await http.get<Org>(`/admin/orgs/${id}`);
  return response.data;
}

export async function updateOrg(id: string, payload: Partial<Org>) {
  const response = await http.patch<Org>(`/admin/orgs/${id}`, payload);
  return response.data;
}

export async function createOrg(payload: Partial<Org>) {
  const response = await http.post<Org>('/admin/orgs', payload);
  return response.data;
}

export async function deleteOrg(id: string) {
  return http.delete(`/admin/orgs/${id}`);
}
