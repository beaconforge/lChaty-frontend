import { useToastState, useToastController } from './use-toast';
import { cn } from '../../lib/utils';

export function ToastList() {
  const toasts = useToastState();
  const { dismiss } = useToastController();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col space-y-3">
      {toasts.map(toast => (
        <button
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className={cn(
            'w-full rounded-md border px-4 py-3 text-left shadow-lg transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            toast.variant === 'destructive' && 'border-destructive bg-destructive/10 text-destructive-foreground',
            toast.variant === 'success' && 'border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-200',
          )}
        >
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.description ? <div className="text-xs text-muted-foreground">{toast.description}</div> : null}
        </button>
      ))}
    </div>
  );
}
