import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

type UIPreferencesState = {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  applyTheme: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
};

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyThemeToDom = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const mode = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
};

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarCollapsed: false,
      applyTheme: mode => {
        applyThemeToDom(mode);
      },
      setTheme: mode => {
        set({ theme: mode });
        get().applyTheme(mode);
      },
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
    }),
    {
      name: 'admin-ui-prefs',
      partialize: state => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
