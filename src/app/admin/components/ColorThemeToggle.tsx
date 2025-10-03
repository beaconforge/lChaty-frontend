import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useUIPreferencesStore } from '../state/useUIPreferences';

export function ColorThemeToggle() {
  const theme = useUIPreferencesStore(state => state.theme);
  const setTheme = useUIPreferencesStore(state => state.setTheme);

  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(nextTheme)}
    >
      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
