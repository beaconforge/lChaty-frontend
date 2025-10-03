const LEVELS = ['G', 'PG', 'PG-13', 'Teen', 'Custom'];

export function SafetyLevelSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Safety</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="rounded-md border border-input bg-background px-2 py-1"
      >
        {LEVELS.map(level => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </label>
  );
}
