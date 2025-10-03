export function TimeLimitDial({ value }: { value: number }) {
  const normalized = Math.min(Math.max(value, 0), 120);
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
      <span className="text-sm text-muted-foreground">Daily limit</span>
      <span className="text-3xl font-semibold">{normalized}m</span>
      <p className="mt-2 text-xs text-muted-foreground">Adjustable per child</p>
    </div>
  );
}
