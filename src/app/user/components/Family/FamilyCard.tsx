import type { FamilyOverview } from '../../api/types';
import { Avatar } from '../Shared/Avatar';

export function FamilyCard({ family }: { family: FamilyOverview }) {
  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Household</h2>
          <p className="text-sm text-muted-foreground">{family.householdId}</p>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Parents</h3>
          <ul className="mt-2 space-y-2">
            {family.parents.map(parent => (
              <li key={parent.id} className="flex items-center gap-3 rounded-md border border-transparent p-2">
                <Avatar name={parent.name} src={parent.avatarUrl} size="sm" />
                <span className="text-sm font-medium">{parent.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Children</h3>
          <ul className="mt-2 space-y-2">
            {family.children.map(child => (
              <li key={child.id} className="flex items-center gap-3 rounded-md border border-transparent p-2">
                <Avatar name={child.name} src={child.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm font-medium">{child.name}</p>
                  <p className="text-xs text-muted-foreground">Safety: {child.safetyLevel ?? 'Unconfigured'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
