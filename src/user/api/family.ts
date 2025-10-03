import { http } from './http';
import type { FamilyOverview, FamilyRequest } from './types';

export async function fetchFamily() {
  const { data } = await http.get<FamilyOverview>('/family');
  return data;
}

export async function fetchFamilyChild(childId: string) {
  const { data } = await http.get(`/family/children/${childId}`);
  return data as Record<string, unknown>;
}

export async function updateFamilyChild(childId: string, payload: Record<string, unknown>) {
  const { data } = await http.patch(`/family/children/${childId}`, payload);
  return data as Record<string, unknown>;
}

export async function submitFamilyRequest(childId: string, payload: Record<string, unknown>) {
  const { data } = await http.post<FamilyRequest>('/family/requests', { childId, ...payload });
  return data;
}

export async function updateFamilyRequest(requestId: string, action: 'approve' | 'deny', note?: string) {
  const { data } = await http.patch<FamilyRequest>(`/family/requests/${requestId}`, { action, note });
  return data;
}
