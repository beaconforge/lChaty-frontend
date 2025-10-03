import { http } from './http';
import { FeatureFlag } from './types';

export async function listFeatureFlags() {
  const response = await http.get<{ data: FeatureFlag[] }>('/admin/flags');
  return response.data;
}

export async function updateFeatureFlag(key: string, payload: Partial<FeatureFlag> & { enabled?: boolean }) {
  const response = await http.patch<FeatureFlag>(`/admin/flags/${key}`, payload);
  return response.data;
}
