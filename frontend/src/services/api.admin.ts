import http from './http'

export async function getProviders() {
  const r = await http.get('/api/admin/providers')
  return r.data
}

export async function getModels() {
  const r = await http.get('/api/admin/models')
  return r.data
}

export async function getAuditLogs() {
  const r = await http.get('/api/admin/audit')
  return r.data
}

export async function getHealth() {
  const r = await http.get('/api/admin/health')
  return r.data
}
