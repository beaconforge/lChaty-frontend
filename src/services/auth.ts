/**
 * Authentication service with route protection and state management
 */

import { userApi, User } from './api.user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthListener = (state: AuthState) => void;

class AuthService {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private listeners: Set<AuthListener> = new Set();
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize authentication state
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.checkAuthStatus();
    return this.initPromise;
  }

  /**
   * Check current authentication status
   */
  private async checkAuthStatus(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const user = await userApi.getMe();
      this.updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      // 401 is expected when not authenticated
      if (error.status === 401) {
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      } else {
        console.warn('Auth check failed:', error.message);
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message || 'Authentication check failed'
        });
      }
    }
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      await userApi.login({ username, password });
      const response = await userApi.getMe();
      
      // Extract the actual user object from the response
      // API returns {user: {...}} but TypeScript expects User directly
      const user = (response as any).user || response;
      
  // Check if this is an admin user and handle routing. Trust the backend's
  // `is_admin` field (which should be derived from the admin_users table)
  // instead of guessing by username. This keeps frontend logic authoritative
  // and avoids accidental privilege elevation.
  const isAdminRoute = window.location.hostname.includes('admin') || window.location.pathname.includes('admin');
  const isUserAdmin = !!user.is_admin;
      
      console.log('Auth routing debug:', {
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        isAdminRoute,
        isUserAdmin,
        username: user.username,
        is_admin: user.is_admin
      });
      
      // Detailed user object debugging
      console.log('Full user object:', user);
      console.log('User object keys:', Object.keys(user));
      console.log('Admin detection breakdown:', {
        'user.is_admin': user.is_admin,
        'Final isUserAdmin': isUserAdmin
      });
      
      console.log('Routing decision:', { isUserAdmin, isAdminRoute, 
        condition1: isUserAdmin && !isAdminRoute,
        condition2: !isUserAdmin && isAdminRoute 
      });
      
      if (isUserAdmin && !isAdminRoute) {
        // Admin user trying to access user portal - redirect to admin portal
        console.log('Admin user on user portal - redirecting to admin portal');
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        // Redirect to admin portal on the admin subdomain
        window.location.href = 'https://local.admin.lchaty.com:5173/admin.html';
        return;
      } else if (!isUserAdmin && isAdminRoute) {
        // Regular user trying to access admin portal - redirect to user portal
        console.log('Regular user trying admin portal - redirecting to user portal');
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        // Redirect to user portal
        window.location.href = 'https://local.lchaty.com:5173/';
        return;
      } else if (isUserAdmin && isAdminRoute) {
        // Admin user on admin portal - ensure we're on the right page
        console.log('Admin user on admin portal - checking if on correct page');
        if (!window.location.pathname.includes('admin.html')) {
          console.log('Admin user on admin domain but wrong page - redirecting to admin.html');
          window.location.href = 'https://local.admin.lchaty.com:5173/admin.html';
          return;
        }
      }
      
      console.log('Setting authenticated state for user:', user.username, 'on', isAdminRoute ? 'admin' : 'user', 'portal');
      this.updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Login failed'
      });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      await userApi.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to authentication state changes
   */
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if user has required permissions
   */
  hasPermission(permission: 'admin' | 'user'): boolean {
    if (!this.state.isAuthenticated || !this.state.user) {
      return false;
    }

    switch (permission) {
      case 'admin':
        return this.state.user.is_admin;
      case 'user':
        return true;
      default:
        return false;
    }
  }

  /**
   * Route protection guard
   */
  requireAuth(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Admin route protection guard
   */
  requireAdmin(): boolean {
    return this.hasPermission('admin');
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const authService = new AuthService();