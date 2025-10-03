export async function bootstrapAuth() {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (r.ok) return { authenticated: true, me: await r.json() } as const;
    if (r.status === 401) return { authenticated: false } as const; // silent — show login
    return { authenticated: false } as const;
  } catch {
    return { authenticated: false } as const;
  }
}
