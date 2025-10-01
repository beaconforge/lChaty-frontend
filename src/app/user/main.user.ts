/**
 * Main user application entry point
 */

import { userApi, User } from '@/services/api.user';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

class UserApp {
  private container: HTMLElement;
  private currentUser: User | null = null;
  private currentPage: 'login' | 'chat' = 'login'; // Tracks current page for navigation

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
      
      // Check if user is already authenticated
      await this.checkAuth();
      
      // Route to appropriate page
      if (this.currentUser) {
        this.showChatPage();
      } else {
        this.showLoginPage();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showLoginPage();
    }
  }

  private async checkAuth(): Promise<void> {
    try {
      this.currentUser = await userApi.getMe();
    } catch (error: any) {
      // Not authenticated or network error
      this.currentUser = null;
      if (error.status !== 401) {
        console.warn('Auth check failed:', error.message);
      }
    }
  }

  private showLoading(): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading...</p>
        </div>
      </div>
    `;
  }

  private showLoginPage(): void {
    this.currentPage = 'login';
    const loginPage = new LoginPage(this.container);
    
    loginPage.onLogin = async (credentials) => {
      try {
        await userApi.login(credentials);
        this.currentUser = await userApi.getMe();
        this.showChatPage();
      } catch (error: any) {
        loginPage.showError(error.message || 'Login failed');
      }
    };

    loginPage.render();
  }

  private showChatPage(): void {
    if (!this.currentUser) {
      this.showLoginPage();
      return;
    }

    this.currentPage = 'chat';
    const chatPage = new ChatPage(this.container, this.currentUser);
    
    chatPage.onLogout = async () => {
      try {
        await userApi.logout();
      } catch (error) {
        console.warn('Logout error:', error);
      } finally {
        this.currentUser = null;
        this.showLoginPage();
      }
    };

    chatPage.render();
  }

  // Public method for navigation
  navigateToLogin(): void {
    this.currentUser = null;
    this.currentPage = 'login'; // Update page tracking
    this.showLoginPage();
  }

  // Get current page state
  getCurrentPage(): 'login' | 'chat' {
    return this.currentPage;
  }
}

// Initialize and start the app
const app = new UserApp();
app.init().catch(console.error);

// Export for external access if needed
export { UserApp };