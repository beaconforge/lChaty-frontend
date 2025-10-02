/**
 * Theme utilities for light/dark mode toggle
 */

export class ThemeManager {
  private static readonly DARK_CLASS = 'dark';
  private static readonly THEME_KEY = 'lchaty-theme';

  static init(): void {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDark();
    } else {
      this.setLight();
    }
  }

  static toggle(): void {
    if (this.isDark()) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  static setDark(): void {
    document.documentElement.classList.add(this.DARK_CLASS);
    localStorage.setItem(this.THEME_KEY, 'dark');
  }

  static setLight(): void {
    document.documentElement.classList.remove(this.DARK_CLASS);
    localStorage.setItem(this.THEME_KEY, 'light');
  }

  static isDark(): boolean {
    return document.documentElement.classList.contains(this.DARK_CLASS);
  }
}