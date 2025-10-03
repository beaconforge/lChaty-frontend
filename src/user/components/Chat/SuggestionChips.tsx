export function SuggestionChips({ suggestions, onSelect }: { suggestions: string[]; onSelect: (value: string) => void }) {
  if (!suggestions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map(suggestion => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-input bg-muted/50 px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
