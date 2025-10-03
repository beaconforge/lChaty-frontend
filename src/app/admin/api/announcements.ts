import { http } from './http';
import { Announcement } from './types';

export async function listAnnouncements() {
  const response = await http.get<{ data: Announcement[] }>('/admin/announcements');
  return response.data;
}

export async function createAnnouncement(payload: Partial<Announcement>) {
  const response = await http.post<Announcement>('/admin/announcements', payload);
  return response.data;
}

export async function updateAnnouncement(id: string, payload: Partial<Announcement>) {
  const response = await http.patch<Announcement>(`/admin/announcements/${id}`, payload);
  return response.data;
}

export async function deleteAnnouncement(id: string) {
  return http.delete(`/admin/announcements/${id}`);
}
