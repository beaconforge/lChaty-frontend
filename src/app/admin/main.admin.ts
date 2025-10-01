/**
 * Main admin application entry point
 */

import { adminApi } from '@/services/api.admin';
import { User } from '@/services/api.user';
import { AdminPortal } from './AdminPortal';

class AdminApp {
  private container: HTMLElement;
  private currentUser: User | null = null;
  private adminPortal?: AdminPortal;

  constructor() {
    this.container = document.getElementById('app')!;
    if (!this.container) {
      throw new Error('App container not found');
    }
  }

  async init() {
    try {
      // Show loading state
      this.showLoading();
      
      // Check admin authentication
      await this.checkAdminAuth();
      
      if (this.currentUser) {
        this.showAdminPortal();
      } else {
        this.showAccessDenied();
      }
    } catch (error) {
      console.error('Failed to initialize admin app:', error);
      this.showError(error as Error);
    }
  }

  private async checkAdminAuth(): Promise<void> {
    try {
      this.currentUser = await adminApi.getMe();
    } catch (error: any) {
      this.currentUser = null;
      
      if (error.status === 401) {
        // Not authenticated - redirect to main app for login
        window.location.href = '/';
        return;
      }
      
      if (error.message?.includes('Admin access required')) {
        // Authenticated but not admin
        throw new Error('Admin access required. Please contact your administrator.');
      }
      
      // Other error
      throw error;
    }
  }

  private showLoading(): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading Admin Portal...</p>
        </div>
      </div>
    `;
  }

  private showAdminPortal(): void {
    if (!this.currentUser) {
      this.showAccessDenied();
      return;
    }

    this.adminPortal = new AdminPortal(this.container, this.currentUser);
    
    this.adminPortal.onLogout = () => {
      // Redirect to main app for logout
      window.location.href = '/';
    };

    this.adminPortal.render();
  }

  private showAccessDenied(): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full">
          <div class="bg-white shadow-lg rounded-lg p-8 text-center">
            <div class="text-red-500 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p class="text-gray-600 mb-6">
              You don't have permission to access the admin portal. 
              Administrator privileges are required.
            </p>
            
            <div class="space-y-3">
              <a href="/" class="btn-primary block">
                Back to lChaty
              </a>
              <p class="text-sm text-gray-500">
                Contact your system administrator if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private showError(error: Error): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full">
          <div class="bg-white shadow-lg rounded-lg p-8 text-center">
            <div class="text-red-500 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p class="text-gray-600 mb-6">${error.message}</p>
            
            <div class="space-y-3">
              <button onclick="window.location.reload()" class="btn-primary block w-full">
                Retry
              </button>
              <a href="/" class="btn-ghost block w-full">
                Back to lChaty
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize and start the admin app
const adminApp = new AdminApp();
adminApp.init().catch(console.error);

// Export for external access if needed
export { AdminApp };