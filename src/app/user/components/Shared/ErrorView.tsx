import { ReactNode } from 'react';

export function ErrorView({ title, description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-6">
      <h2 className="text-lg font-semibold text-destructive">{title ?? 'Something went wrong'}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
