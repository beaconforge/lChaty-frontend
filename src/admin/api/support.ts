import { http } from './http';
import { PaginatedResponse, SupportTicket } from './types';

export async function listTickets(params: Record<string, unknown>) {
  const response = await http.get<PaginatedResponse<SupportTicket>>('/admin/support/tickets', { params });
  return response.data;
}

export async function getTicket(id: string) {
  const response = await http.get<SupportTicket>(`/admin/support/tickets/${id}`);
  return response.data;
}

export async function replyToTicket(id: string, payload: { message: string }) {
  const response = await http.post(`/admin/support/tickets/${id}/reply`, payload);
  return response.data;
}
