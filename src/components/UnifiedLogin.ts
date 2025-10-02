/**
 * Unified Login component that handles both user and admin authentication
 * with automatic routing based on user privileges
 */

import { authService } from '../services/auth';
import { loadingService, LoadingSpinner } from '../services/loading';
import { errorService } from '../services/error';

export class UnifiedLogin {
  private container: HTMLElement;
  private loadingSpinner?: LoadingSpinner;
  private unsubscribeAuth?: () => void;
  private hasAttemptedLogin: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupAuthSubscription();
  }

  private setupAuthSubscription(): void {
    this.unsubscribeAuth = authService.subscribe((authState) => {
      this.updateAuthState(authState);
    });
  }

  private updateAuthState(authState: any): void {
    const submitButton = this.container.querySelector('#loginButton') as HTMLButtonElement;
    const errorElement = this.container.querySelector('#errorMessage');
    
    if (submitButton) {
      submitButton.disabled = authState.isLoading;
      submitButton.innerHTML = authState.isLoading 
        ? '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Signing in...</div>'
        : 'Sign In';
    }
    
    if (errorElement && authState.error && this.hasAttemptedLogin) {
      this.showError(authState.error);
    } else if (errorElement && !authState.isLoading) {
      this.hideError();
    }
  }

  render(): void {
    const currentHost = window.location.hostname;
    const isAdminPortal = currentHost.includes('admin');
    const portalType = isAdminPortal ? 'Admin' : 'User';
    const portalDescription = isAdminPortal 
      ? 'Access the administrative dashboard' 
      : 'Start chatting with AI models';

    this.container.innerHTML = `
      <main class="min-h-screen bg-[var(--lchaty-bg)] text-[var(--lchaty-fg)]">
        <section class="mx-auto max-w-5xl px-4 py-12 flex flex-col items-center">
          <img 
            src="/assets/lchaty-logo-main.svg" 
            alt="lChaty logo" 
            class="w-full max-w-[520px]" 
          />
          <h1 class="mt-6 text-3xl font-bold text-center">lChaty ${portalType} Portal</h1>
          <p class="mt-2 text-[var(--lchaty-muted)]">${portalDescription}</p>

          <div class="mt-8 w-full max-w-[520px] rounded-xl border border-[var(--lchaty-border)] bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <form id="loginForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[var(--lchaty-fg)]">Username</label>
                <input 
                  id="username"
                  name="username"
                  data-testid="login-username" 
                  type="text" 
                  required
                  class="mt-2 w-full rounded-md border border-[var(--lchaty-border)] bg-white dark:bg-transparent px-3 py-2 ring-2 ring-transparent focus:ring-[color:rgba(37,99,235,0.12)] outline-none text-[var(--lchaty-fg)] placeholder:text-[var(--lchaty-muted)]" 
                  placeholder="Enter your username"
                  autocomplete="username"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--lchaty-fg)]">Password</label>
                <input 
                  id="password"
                  name="password"
                  data-testid="login-password" 
                  type="password" 
                  required
                  class="mt-2 w-full rounded-md border border-[var(--lchaty-border)] bg-white dark:bg-transparent px-3 py-2 ring-2 ring-transparent focus:ring-[color:rgba(37,99,235,0.12)] outline-none text-[var(--lchaty-fg)] placeholder:text-[var(--lchaty-muted)]" 
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
              </div>

              <div class="flex items-center">
                <input 
                  id="showPassword" 
                  type="checkbox" 
                  class="h-4 w-4 rounded border-[var(--lchaty-border)] text-blue-600 focus:ring-blue-500"
                />
                <label for="showPassword" class="ml-2 text-sm text-[var(--lchaty-muted)]">Show password</label>
              </div>

              <div id="errorMessage" class="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm"></div>

              <button 
                id="loginButton"
                type="submit" 
                data-testid="login-submit"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-sm text-[var(--lchaty-muted)]">
                Need an account? 
                <button 
                  id="signupLink" 
                  class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Sign up here
                </button>
              </p>
            </div>
            
            ${isAdminPortal ? `
              <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p class="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Admin Portal:</strong> Administrator credentials required.
                </p>
              </div>
            ` : ''}
          </div>
        </section>
      </main>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#loginForm') as HTMLFormElement;
    const showPasswordCheckbox = this.container.querySelector('#showPassword') as HTMLInputElement;
    const passwordInput = this.container.querySelector('#password') as HTMLInputElement;
    const signupLink = this.container.querySelector('#signupLink') as HTMLButtonElement;

    if (showPasswordCheckbox && passwordInput) {
      showPasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
      });
    }

    if (signupLink) {
      signupLink.addEventListener('click', () => {
        // Dispatch custom event for navigation
        this.container.dispatchEvent(new CustomEvent('navigate-signup', { bubbles: true }));
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) {
          this.showError('Please enter both username and password');
          return;
        }

        this.hasAttemptedLogin = true;
        
        try {
          loadingService.start('login');
          
          // The auth service will handle routing automatically based on user privileges
          await authService.login(username, password);
          
          loadingService.success('login');
        } catch (error) {
          const errorInfo = errorService.handleApiError(error, 'login');
          loadingService.error('login', errorInfo.message);
          this.showError(errorInfo.message);
        }
      });
    }
  }

  private showError(message: string): void {
    const errorElement = this.container.querySelector('#errorMessage');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  private hideError(): void {
    const errorElement = this.container.querySelector('#errorMessage');
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  destroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.loadingSpinner) {
      this.loadingSpinner.destroy();
    }
  }
}