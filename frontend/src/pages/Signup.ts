import { signup } from '../services/api.user';
import { authService } from '../services/auth';
import { loadingService } from '../services/loading';
import { errorService } from '../services/error';

export class Signup {
  private container: HTMLElement;
  public onSignupSuccess?: () => void;
  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <main class="min-h-screen bg-[var(--lchaty-bg)] text-[var(--lchaty-fg)]">
        <section class="mx-auto max-w-2xl px-4 py-12 flex flex-col items-center">
          <h1 class="mt-6 text-2xl font-bold text-center">Create an account</h1>
          <p class="mt-2 text-[var(--lchaty-muted)]">Sign up to start using lChaty</p>

          <div class="mt-8 w-full rounded-xl border border-[var(--lchaty-border)] bg-white/60 dark:bg-white/5 p-6 shadow-sm">
            <form id="signupForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium">Username</label>
                <input id="username" name="username" type="text" required class="mt-2 w-full rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Email (optional)</label>
                <input id="email" name="email" type="email" class="mt-2 w-full rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Password</label>
                <input id="password" name="password" type="password" required class="mt-2 w-full rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required class="mt-2 w-full rounded-md px-3 py-2" />
              </div>

              <div id="errorMessage" class="hidden text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md"></div>

              <div class="flex gap-2">
                <button data-testid="signup-submit" type="submit" class="flex-1 rounded-md bg-[var(--lchaty-accent-600)] text-white h-10 font-semibold">Create account</button>
                <button id="cancelSignup" type="button" class="rounded-md border px-4">Cancel</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#signupForm') as HTMLFormElement;
    const cancel = this.container.querySelector('#cancelSignup') as HTMLButtonElement;

    cancel?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.onSignupSuccess) {
        // treat cancel as navigating back to login
        this.onSignupSuccess();
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const username = (fd.get('username') as string || '').trim();
      const email = (fd.get('email') as string || '').trim();
      const password = (fd.get('password') as string || '');
      const confirm = (fd.get('confirmPassword') as string || '');

      if (!username || !password) {
        this.showError('Username and password are required');
        return;
      }
      if (password !== confirm) {
        this.showError('Passwords do not match');
        return;
      }

      try {
        loadingService.start('signup');
        await signup({ username, password, email: email || undefined });

        // Auto-login after signup
        await authService.login(username, password);

        loadingService.success('signup');
        if (this.onSignupSuccess) this.onSignupSuccess();
      } catch (err) {
        const info = errorService.handleApiError(err, 'signup');
        loadingService.error('signup', info.message);
        this.showError(info.message);
      }
    });
  }

  private showError(msg: string) {
    const el = this.container.querySelector('#errorMessage') as HTMLElement;
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }
}
