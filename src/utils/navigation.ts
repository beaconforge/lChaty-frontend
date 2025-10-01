/**
 * Navigation utilities for cross-app routing between user and admin interfaces
 * 
 * lChaty uses hostname-based routing:
 * - User app: https://local.lchaty.com:5173
 * - Admin app: https://local.admin.lchaty.com:5173
 */

import { USER_BASE_URL, ADMIN_BASE_URL } from '@/config/backend';

/**
 * Get current app type based on hostname
 */
export function getCurrentApp(): 'user' | 'admin' {
  if (typeof window === 'undefined') return 'user';
  
  const hostname = window.location.hostname;
  return hostname.includes('admin') ? 'admin' : 'user';
}

/**
 * Check if currently on user app
 */
export function isUserApp(): boolean {
  return getCurrentApp() === 'user';
}

/**
 * Check if currently on admin app
 */
export function isAdminApp(): boolean {
  return getCurrentApp() === 'admin';
}

/**
 * Navigate to user app
 * @param path - Optional path to navigate to (default: '/')
 */
export function navigateToUserApp(path: string = '/'): void {
  const url = new URL(path, USER_BASE_URL);
  window.location.href = url.toString();
}

/**
 * Navigate to admin app
 * @param path - Optional path to navigate to (default: '/')
 */
export function navigateToAdminApp(path: string = '/'): void {
  const url = new URL(path, ADMIN_BASE_URL);
  window.location.href = url.toString();
}

/**
 * Navigate to the other app (user <-> admin)
 * @param path - Optional path to navigate to (default: '/')
 */
export function switchApp(path: string = '/'): void {
  if (isUserApp()) {
    navigateToAdminApp(path);
  } else {
    navigateToUserApp(path);
  }
}

/**
 * Get URL for user app
 * @param path - Optional path (default: '/')
 */
export function getUserAppUrl(path: string = '/'): string {
  return new URL(path, USER_BASE_URL).toString();
}

/**
 * Get URL for admin app
 * @param path - Optional path (default: '/')
 */
export function getAdminAppUrl(path: string = '/'): string {
  return new URL(path, ADMIN_BASE_URL).toString();
}

/**
 * Get current base URL based on app type
 */
export function getCurrentBaseUrl(): string {
  return isAdminApp() ? ADMIN_BASE_URL : USER_BASE_URL;
}