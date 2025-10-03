export function KidsVoiceToggle({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full bg-primary/20 px-4 py-2 text-primary">
      <input
        type="checkbox"
        checked={enabled}
        onChange={event => onChange(event.target.checked)}
        className="h-6 w-6 rounded-full border border-primary"
      />
      <span className="text-lg font-semibold">Read aloud</span>
    </label>
  );
}
