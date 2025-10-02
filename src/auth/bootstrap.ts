export async function bootstrapAuth() {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (r.ok) return { authenticated: true, me: await r.json() };
    if (r.status === 401) return { authenticated: false }; // silent "not logged in"
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}