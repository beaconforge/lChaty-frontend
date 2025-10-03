import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

type UIPanelState = {
  theme: Theme;
  compactMode: boolean;
  language: string;
  panelSizes: Record<string, number>;
  setTheme: (theme: Theme) => void;
  setCompactMode: (value: boolean) => void;
  setLanguage: (value: string) => void;
  setPanelSize: (panel: string, size: number) => void;
  applyTheme: (theme: Theme) => void;
};

function updateDocumentTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

export const useUIStore = create<UIPanelState>(set => ({
  theme: 'system',
  compactMode: false,
  language: 'en',
  panelSizes: {},
  setTheme: theme => set(state => ({ ...state, theme })),
  setCompactMode: value => set(state => ({ ...state, compactMode: value })),
  setLanguage: value => set(state => ({ ...state, language: value })),
  setPanelSize: (panel, size) =>
    set(state => ({
      ...state,
      panelSizes: {
        ...state.panelSizes,
        [panel]: size,
      },
    })),
  applyTheme: theme => updateDocumentTheme(theme),
}));

useUIStore.subscribe(state => {
  updateDocumentTheme(state.theme);
});
