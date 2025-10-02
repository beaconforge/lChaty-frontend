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
      const user = await userApi.getMe();
      
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