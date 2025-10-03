import { http } from './http';
import type { CreateThreadPayload, Message, SendMessagePayload, ThreadSummary } from './types';

export async function listThreads(params?: { query?: string; page?: number; limit?: number }) {
  const { data } = await http.get<ThreadSummary[]>('/threads', { params });
  return data;
}

export async function createThread(payload: CreateThreadPayload) {
  const { data } = await http.post<{ id: string }>('/threads', payload);
  return data;
}

export async function fetchMessages(threadId: string, cursor?: string) {
  const { data } = await http.get<Message[]>(`/threads/${threadId}/messages`, { params: { cursor } });
  return data;
}

export async function sendMessage(threadId: string, payload: SendMessagePayload) {
  const { data } = await http.post<Message>(`/threads/${threadId}/messages`, payload);
  return data;
}

export async function deleteThread(threadId: string) {
  await http.delete(`/threads/${threadId}`);
}
