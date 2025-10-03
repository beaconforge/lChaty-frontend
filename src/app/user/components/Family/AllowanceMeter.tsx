export function AllowanceMeter({ minutes, limit }: { minutes: number; limit: number }) {
  const ratio = Math.min(minutes / limit, 1);
  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground">Screen time allowance</h4>
      <div className="mt-2 h-3 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${ratio * 100}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {minutes} of {limit} minutes used
      </p>
    </div>
  );
}
