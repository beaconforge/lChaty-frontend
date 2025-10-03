import { normalizeAdminUser, RawAdminUser } from '../api/types';

export async function bootstrapAuth() {
  try {
    const response = await fetch('/api/me', {
      credentials: 'include',
      headers: {
        'X-Admin-Bootstrap': 'true',
      },
    });

    if (response.ok) {
      const me = (await response.json()) as RawAdminUser;
      return { authenticated: true as const, me: normalizeAdminUser(me) };
    }

    if (response.status === 401) {
      return { authenticated: false as const };
    }

    console.warn('Unexpected /api/me bootstrap status', response.status);
    return { authenticated: false as const };
  } catch (error) {
    console.error('bootstrapAuth error', error);
    return { authenticated: false as const };
  }
}
