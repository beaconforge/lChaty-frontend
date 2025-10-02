/**
 * Login page component
 */

import { LoginRequest } from '@/services/api.user';

export class LoginPage {
  private container: HTMLElement;
  public onLogin?: (credentials: LoginRequest) => Promise<void>;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 p-8">
          <div class="text-center">
            <img src="/assets/lchaty-logo.svg" alt="lChaty" class="mx-auto h-20 w-full object-contain -mx-8" />
            <h1 class="mt-6 text-3xl font-bold text-white">Foundation. Innovation. Connection.</h1>
            <p class="mt-3 text-sm text-slate-300">Sign in to continue</p>
          </div>
          
          <form id="loginForm" class="mt-8 space-y-6">
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-white mb-2">Username</label>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  class="w-full px-4 py-3 border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                  autocomplete="username"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  class="w-full px-4 py-3 border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <div id="errorMessage" class="hidden text-red-300 text-sm text-center bg-red-900/50 p-3 rounded-md border border-red-800"></div>

            <div>
              <button 
                type="submit" 
                id="loginButton"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-slate-300">
                Want to learn more about our beta?
              </p>
              <a href="#" id="betaLink" class="inline-flex w-full mt-2 items-center justify-center rounded-lg border border-blue-500 px-4 py-3 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Explore the Beta Program
              </a>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#loginForm') as HTMLFormElement;
    const button = this.container.querySelector('#loginButton') as HTMLButtonElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!this.onLogin) return;

      const formData = new FormData(form);
      const credentials: LoginRequest = {
        username: formData.get('username') as string,
        password: formData.get('password') as string
      };

      // Validate inputs
      if (!credentials.username.trim() || !credentials.password.trim()) {
        this.showError('Please fill in all fields');
        return;
      }

      // Show loading state
      button.disabled = true;
      button.textContent = 'Signing in...';
      this.hideError();

      try {
        await this.onLogin(credentials);
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Login error:', error);
      } finally {
        // Reset button state
        button.disabled = false;
        button.textContent = 'Sign in';
      }
    });

    // Handle signup link (placeholder for future implementation)
    const signupLink = this.container.querySelector('#signupLink');
    signupLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showError('Signup functionality coming soon!');
    });
  }

  showError(message: string): void {
    const errorElement = this.container.querySelector('#errorMessage') as HTMLElement;
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  private hideError(): void {
    const errorElement = this.container.querySelector('#errorMessage') as HTMLElement;
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }
}