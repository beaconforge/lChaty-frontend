import { http } from './http';
import type { KidsPreset, Message } from './types';

export async function fetchKidsPresets() {
  const { data } = await http.get<KidsPreset[]>('/kids/presets');
  return data;
}

export async function sendKidsPrompt(payload: { presetKey: string; extras?: Record<string, unknown> }) {
  const { data } = await http.post<Message>('/kids/prompt', payload);
  return data;
}
