/**
 * Login page component with enhanced authentication, loading, and error handling
 */

import { authService } from '../services/auth';
import { loadingService, LoadingSpinner } from '../services/loading';
import { errorService } from '../services/error';

export class Login {
  private container: HTMLElement;
  private loadingSpinner?: LoadingSpinner;
  private unsubscribeAuth?: () => void;
  public onLogin?: (credentials: { username: string; password: string }) => Promise<void>;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupAuthSubscription();
  }

  private setupAuthSubscription(): void {
    this.unsubscribeAuth = authService.subscribe((authState) => {
      // Update UI based on auth state
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
    
    if (errorElement && authState.error) {
      this.showError(authState.error);
    } else if (errorElement && !authState.isLoading) {
      this.hideError();
    }
  }

  render(): void {
    this.container.innerHTML = `
      <main class="min-h-screen bg-[var(--lchaty-bg)] text-[var(--lchaty-fg)]">
        <section class="mx-auto max-w-5xl px-4 py-12 flex flex-col items-center">
          <img 
            src="/assets/lchaty-logo-main.svg" 
            alt="lChaty logo" 
            class="w-full max-w-[520px]" 
          />
          <h1 class="mt-6 text-3xl font-bold text-center">Foundation. Innovation. Connection.</h1>
          <p class="mt-2 text-[var(--lchaty-muted)]">Sign in to continue</p>

          <div class="mt-8 w-full max-w-[520px] rounded-xl border border-[var(--lchaty-border)] bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <form id="loginForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[var(--lchaty-fg)]">Username</label>
                <input 
                  id="username"
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
                  data-testid="login-password" 
                  type="password" 
                  required
                  class="mt-2 w-full rounded-md border border-[var(--lchaty-border)] bg-white dark:bg-transparent px-3 py-2 ring-2 ring-transparent focus:ring-[color:rgba(37,99,235,0.12)] outline-none text-[var(--lchaty-fg)] placeholder:text-[var(--lchaty-muted)]" 
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
              </div>

              <label class="flex items-center gap-2 text-sm text-[var(--lchaty-fg)]">
                <input type="checkbox" id="showPassword" class="rounded border-[var(--lchaty-border)]" />
                Show password
              </label>

              <div id="errorMessage" class="hidden text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md"></div>

              <button 
                data-testid="login-submit" 
                type="submit"
                class="w-full rounded-md bg-[var(--lchaty-accent-600)] hover:bg-[var(--lchaty-accent-500)] text-white h-10 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </form>
          </div>

          <p class="mt-6 text-[var(--lchaty-muted)]">Want to learn more about our beta?</p>
          <a 
            href="#"
            class="mt-2 inline-flex items-center justify-center rounded-md bg-[var(--lchaty-accent-600)] hover:bg-[var(--lchaty-accent-500)] text-white px-5 h-10 font-semibold transition-colors"
          >
            Explore the Beta Program
          </a>
        </section>
      </main>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#loginForm') as HTMLFormElement;
    const showPasswordCheckbox = this.container.querySelector('#showPassword') as HTMLInputElement;
    const passwordInput = this.container.querySelector('#password') as HTMLInputElement;

    if (showPasswordCheckbox && passwordInput) {
      showPasswordCheckbox.addEventListener('change', () => {
        passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
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

        try {
          loadingService.start('login');
          await authService.login(username, password);
          loadingService.success('login');
          
          // Call the success callback if provided
          if (this.onLogin) {
            await this.onLogin({ username, password });
          }
        } catch (error) {
          const errorInfo = errorService.handleApiError(error, 'login');
          loadingService.error('login', errorInfo.message);
          this.showError(errorInfo.message);
        }
      });
    }
  }

  showError(message: string): void {
    const errorElement = this.container.querySelector('#errorMessage');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  hideError(): void {
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