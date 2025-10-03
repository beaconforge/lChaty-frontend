export async function bootstrapAuth() {
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    if (r.ok) {
      let me: any = null;
      try {
        me = await r.json();
      } catch (parseErr) {
        // If parsing fails, avoid throwing and treat as unauthenticated
        console.warn('bootstrapAuth: failed to parse /api/me response', parseErr);
        me = null;
      }

      // Sanitized debug logging: only enabled on local dev hosts and only
      // surface low-risk fields. Avoid logging tokens or sensitive cookies.
      try {
        if (typeof window !== 'undefined' && window.location.hostname.includes('local.')) {
          const safe: Record<string, any> = {};
          if (me && typeof me === 'object') {
            ['id', 'username', 'email', 'roles', 'is_admin'].forEach(k => {
              if (me[k] !== undefined) safe[k] = me[k];
            });
            if (Object.keys(safe).length === 0) {
              // If none of the expected fields are present, just log the top-level keys
              safe._keys = Object.keys(me || {});
            }
          } else {
            safe._type = typeof me;
          }
          // Use debug so this can be filtered in production consoles
          // and so it's less likely to leak into user-facing logs.
          console.debug('bootstrapAuth /api/me (sanitized):', safe);
        }
      } catch (logErr) {
        // Never let logging break the auth flow
        console.warn('bootstrapAuth: logging failed', logErr);
      }

      return { authenticated: true, me };
    }

    if (r.status === 401) return { authenticated: false }; // silent "not logged in"
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}