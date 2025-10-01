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
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to lChaty
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Access your AI chat platform
            </p>
          </div>
          
          <form id="loginForm" class="mt-8 space-y-6">
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  required 
                  class="input mt-1"
                  placeholder="Enter your username"
                  autocomplete="username"
                />
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  class="input mt-1"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <div id="errorMessage" class="hidden text-red-600 text-sm text-center bg-red-50 p-3 rounded-md"></div>

            <div>
              <button 
                type="submit" 
                id="loginButton"
                class="btn-primary w-full"
              >
                Sign in
              </button>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Don't have an account? 
                <a href="#" id="signupLink" class="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </a>
              </p>
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