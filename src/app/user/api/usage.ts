import { http } from './http';
import type { UsageSummary } from './types';

export async function fetchUsageSummary(params: { from?: string; to?: string }) {
  const { data } = await http.get<UsageSummary>('/usage/summary', { params });
  return data;
}
