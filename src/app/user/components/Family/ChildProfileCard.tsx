import { useState } from 'react';
import { SafetyLevelSelect } from './SafetyLevelSelect';
import { TimeLimitDial } from './TimeLimitDial';
import { AllowanceMeter } from './AllowanceMeter';
import type { ChildSummary } from '../../api/types';

export function ChildProfileCard({ child, onSafetyChange }: { child: ChildSummary; onSafetyChange?: (level: string) => void }) {
  const [safety, setSafety] = useState(child.safetyLevel ?? 'PG');

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{child.name}</h3>
          <p className="text-xs text-muted-foreground">Child ID: {child.id}</p>
        </div>
        <SafetyLevelSelect
          value={safety}
          onChange={value => {
            setSafety(value);
            onSafetyChange?.(value);
          }}
        />
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AllowanceMeter minutes={60} limit={120} />
        <TimeLimitDial value={safety === 'G' ? 45 : 90} />
      </div>
    </section>
  );
}
