/**
 * Header component for lChaty application
 */

import { ThemeManager } from '../lib/theme';

export class Header {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): void {
    this.container.innerHTML = `
      <header class="sticky top-0 z-50 h-14 px-4 bg-[var(--lchaty-bg)] border-b border-[var(--lchaty-border)]">
        <div class="flex items-center justify-between h-full max-w-5xl mx-auto">
          <div class="flex items-center gap-3">
            <img 
              src="/assets/lchaty-icon.svg" 
              alt="lChaty logo" 
              class="h-8 w-auto"
              data-testid="header-logo"
            />
            <span class="font-semibold text-[var(--lchaty-fg)]">lChaty</span>
          </div>
          
          <div class="flex items-center gap-4">
            <a 
              href="/" 
              class="text-sm text-[var(--lchaty-fg)] hover:text-[var(--lchaty-accent-600)] transition-colors"
              data-testid="header-home"
            >
              Home
            </a>
            <button 
              id="theme-toggle"
              class="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              <svg class="w-4 h-4 text-[var(--lchaty-fg)] dark:hidden" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
              </svg>
              <svg class="w-4 h-4 text-[var(--lchaty-fg)] hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const themeToggle = this.container.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        ThemeManager.toggle();
      });
    }
  }
}