import { http } from './http';

export async function fetchInvoices(params: Record<string, unknown>) {
  const response = await http.get('/admin/billing/invoices', { params });
  return response.data;
}

export async function fetchBillingSummary(params: Record<string, unknown>) {
  const response = await http.get('/admin/billing/summary', { params });
  return response.data;
}
