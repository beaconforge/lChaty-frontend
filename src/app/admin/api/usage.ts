import { http } from './http';

type UsageSeriesPoint = {
  date: string;
  messages: number;
  activeUsers: number;
};

export async function fetchUsage(params: Record<string, unknown>) {
  const response = await http.get<{ data: UsageSeriesPoint[] }>('/admin/usage', { params });
  return response.data;
}
