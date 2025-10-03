import { http } from './http';
import { AuditEvent, PaginatedResponse } from './types';

export async function listAuditEvents(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<AuditEvent>>('/admin/audit', { params });
  return response.data;
}

export async function exportAudit(params: Record<string, unknown>) {
  const response = await http.get('/admin/audit/export.csv', { params, responseType: 'blob' });
  return response.data as Blob;
}
