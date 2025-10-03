import { http } from './http';
import { ModerationReport, PaginatedResponse } from './types';

export async function listModerationReports(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<ModerationReport>>('/admin/moderation/reports', { params });
  return response.data;
}

export async function resolveModerationReport(id: string, payload: { action: string }) {
  const response = await http.post(`/admin/moderation/reports/${id}/resolve`, payload);
  return response.data;
}

export async function getModerationMessage(id: string) {
  const response = await http.get(`/admin/moderation/messages/${id}`);
  return response.data;
}
