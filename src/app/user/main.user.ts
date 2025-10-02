/**
 * Main user application entry point
 */

import { userApi, User } from '@/services/api.user';
import { authService } from '@/services/auth';
import { errorService, ErrorBoundary } from '@/services/error';
import { loadingService } from '@/services/loading';
import { Header } from '../../components/Header';
import { Login } from '../../pages/Login';
import { ThemeManager } from '../../lib/theme';
import { ChatPage } from './pages/ChatPage';

console.log('Main user app loaded');

class UserApp {
  private container: HTMLElement;
  private currentUser: User | null = null;
  private currentPage: 'login' | 'chat' = 'login'; // Tracks current page for navigation
  private currentLogin?: Login;

  constructor() {
    this.container = document.getElementById('app')!;
    if (!this.container) {
      throw new Error('App container not found');
    }
    
    // Initialize enhanced services
    ThemeManager.init();
    this.setupErrorBoundary();
    this.setupAuthSubscription();
  }

  private setupErrorBoundary(): void {
    // Set up global error boundary for the application
    new ErrorBoundary(this.container);
  }

  private setupAuthSubscription(): void {
    authService.subscribe((authState) => {
      if (authState.isAuthenticated && authState.user) {
        this.currentUser = authState.user;
        if (this.currentPage === 'login') {
          this.showChatPage();
        }
      } else if (!authState.isAuthenticated) {
        this.currentUser = null;
        if (this.currentPage === 'chat') {
          this.showLoginPage();
        }
      }
    });
  }

  async init() {
    try {
      // Ensure something is visible immediately while we initialise auth
      // so the page doesn't remain a white/blank screen while backend
      // auth checks (which may return 401) complete.
      this.showLoginPage();
      loadingService.start('app-init');
      
      // Initialize authentication
      await authService.init();
      
      loadingService.success('app-init');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      errorService.handleApiError(error, 'app-init');
      loadingService.error('app-init', 'Failed to initialize application');
      
      // Show login page as fallback
      this.showLoginPage();
    }
  }



  private showLoginPage(): void {
    this.currentPage = 'login';
    
    // Cleanup previous login if exists
    if (this.currentLogin) {
      this.currentLogin.destroy();
    }
    
    // Clear container and create header + login
    this.container.innerHTML = '';
    
    // Create header container
    const headerContainer = document.createElement('div');
    this.container.appendChild(headerContainer);
    
    // Create main content container  
    const mainContainer = document.createElement('div');
    this.container.appendChild(mainContainer);
    
    // Render header
    const header = new Header(headerContainer);
    header.render();
    
    // Render enhanced login page
    this.currentLogin = new Login(mainContainer);
    
    // The auth service handles login automatically, but we can provide additional success handling
    this.currentLogin.onLogin = async () => {
      // Additional success handling if needed
      console.log('Login successful via auth service');
    };

    this.currentLogin.render();
  }

  private showChatPage(): void {
    if (!this.currentUser) {
      this.showLoginPage();
      return;
    }

    this.currentPage = 'chat';
    
    // Clear container before rendering chat page
    this.container.innerHTML = '';
    
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