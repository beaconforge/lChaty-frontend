/**
 * Main user application entry point
 */

import { userApi, User } from '@/services/api.user';
import { authService } from '@/services/auth';
import { errorService, ErrorBoundary } from '@/services/error';
import { loadingService } from '@/services/loading';
import { Header } from '../../components/Header';
import { UnifiedLogin } from '../../components/UnifiedLogin';
import { Signup } from '../../pages/Signup';
import { ThemeManager } from '../../lib/theme';
import { ChatPage } from './pages/ChatPage';
import { bootstrapAuth } from '@/auth/bootstrap';

console.log('Main user app loaded');

// SECURITY: Prevent user app from running on admin domains
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isAdminDomain = hostname.includes('admin.lchaty.com') || hostname.includes('local.admin');
  
  if (isAdminDomain) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fef2f2;">
        <div style="text-align: center; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #fecaca;">
          <h1 style="font-size: 24px; font-weight: bold; color: #991b1b; margin-bottom: 8px;">Access Denied</h1>
          <p style="color: #dc2626;">User interface cannot be accessed from admin domains.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">Please use the correct domain.</p>
        </div>
      </div>
    `;
    throw new Error('User app blocked on admin domain for security');
  }
}

class UserApp {
  private container: HTMLElement;
  private currentUser: User | null = null;
  private currentPage: 'login' | 'chat' = 'login'; // Tracks current page for navigation
  private currentLogin?: UnifiedLogin;
  private currentSignup?: Signup;

  constructor() {
    const mount = document.getElementById('app-root') || document.getElementById('app');
    if (!mount) {
      throw new Error('App container not found');
    }
    this.container = mount;
    
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
      console.log('Starting user app initialization...');
      
      // Ensure something is visible immediately while we initialise auth
      // so the page doesn't remain a white/blank screen while backend
      // auth checks (which may return 401) complete.
      console.log('Showing login page...');
      this.showLoginPage();
      loadingService.start('app-init');
      
      // Silent bootstrap auth check
      console.log('Running bootstrap auth check...');
      const boot = await bootstrapAuth();
      console.log('Bootstrap result:', boot);
      
      if (boot.authenticated) {
        // User is already authenticated, route to chat
        // Extract user from the response object
        console.log('User authenticated, extracting user data...');
        const user = boot.me.user || boot.me;
        console.log('Extracted user:', user);
        this.currentUser = user;
        console.log('Showing chat page...');
        this.showChatPage();
      } else {
        console.log('User not authenticated, staying on login page');
        // Not authenticated, stay on login (no error shown)
        // The auth service will handle explicit login attempts
      }
      
      loadingService.success('app-init');
      console.log('User app initialization complete');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error
      });
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
    
  // Clear container and render a minimal, centered login (no header)
  this.container.innerHTML = '';
    
  // Create main content container
  const mainContainer = document.createElement('div');
  this.container.appendChild(mainContainer);

  // Render enhanced login page (UnifiedLogin provides the full centered layout)
  this.currentLogin = new UnifiedLogin(mainContainer);
    
    // The UnifiedLogin component handles login automatically through auth service
    console.log('Login page rendered with unified login component');

    this.currentLogin.render();

    // Listen for navigation events from the login page
    mainContainer.addEventListener('navigate-signup', () => {
      this.showSignupPage();
    });
  }

  private showSignupPage(): void {
    this.currentPage = 'login';
    // cleanup existing login
    if (this.currentLogin) {
      this.currentLogin.destroy();
      this.currentLogin = undefined;
    }

    // Clear container and render header + signup page
    this.container.innerHTML = '';
    const headerContainer = document.createElement('div');
    this.container.appendChild(headerContainer);
    const mainContainer = document.createElement('div');
    this.container.appendChild(mainContainer);

    const header = new Header(headerContainer);
    header.render();

    this.currentSignup = new Signup(mainContainer);
    this.currentSignup.onSignupSuccess = () => {
      // After signup or cancel, go back to login view
      this.showLoginPage();
    };
    this.currentSignup.render();
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