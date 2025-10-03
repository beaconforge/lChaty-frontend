import { useUIStore } from '../../state/useUIStore';

export default function SettingsPage() {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const compactMode = useUIStore(state => state.compactMode);
  const setCompactMode = useUIStore(state => state.setCompactMode);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize the app experience to match your preferences.</p>
      </header>
      <section className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">Choose a theme to match your environment.</p>
          <div className="mt-3 flex gap-2">
            {['light', 'dark', 'system'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option as typeof theme)}
                className={`rounded-md border px-3 py-2 text-sm ${theme === option ? 'border-primary bg-primary/10 text-primary' : 'border-input'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Layout</h2>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={event => setCompactMode(event.target.checked)}
              className="h-4 w-4"
            />
            <span>Compact messages</span>
          </label>
        </div>
      </section>
    </div>
  );
}
