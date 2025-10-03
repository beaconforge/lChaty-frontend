import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function KidsTileButton({ label, description, icon, onClick }: { label: string; description?: string; icon?: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-40 flex-col items-start justify-between rounded-3xl border-4 border-primary/60 bg-primary/10 p-6 text-left shadow-lg transition hover:scale-[1.02] hover:bg-primary/20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary',
      )}
    >
      <div className="text-4xl" aria-hidden>
        {icon ?? '🌟'}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-primary">{label}</p>
        {description ? <p className="mt-1 text-base text-primary/80">{description}</p> : null}
      </div>
    </button>
  );
}
