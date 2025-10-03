import { PropsWithChildren, useEffect } from 'react';
import { useUIPreferencesStore } from '../state/useUIPreferences';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useUIPreferencesStore(state => state.theme);
  const applyTheme = useUIPreferencesStore(state => state.applyTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  return children;
}
