import { http } from './http';
import type { CurrentUser } from './types';

export async function fetchProfile() {
  const { data } = await http.get<CurrentUser>('/me');
  return data;
}

export async function updateProfile(payload: Partial<Pick<CurrentUser, 'username'>>) {
  const { data } = await http.patch<CurrentUser>('/profile', payload);
  return data;
}
