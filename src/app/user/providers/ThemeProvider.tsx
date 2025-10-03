import { PropsWithChildren, useEffect } from 'react';
import { useUIStore } from '../state/useUIStore';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useUIStore(state => state.theme);
  const applyTheme = useUIStore(state => state.applyTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  return children;
}
