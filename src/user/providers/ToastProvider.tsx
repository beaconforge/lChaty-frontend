import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { cn } from '../utils/cn';

type ToastType = 'info' | 'success' | 'error';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastContextValue = {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts(prev => [...prev, { ...toast, id: nanoid() }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'w-full max-w-sm rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur',
              toast.type === 'success' && 'border-emerald-500/60',
              toast.type === 'error' && 'border-destructive/50',
              toast.type === 'info' && 'border-primary/40',
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="text-xs text-muted-foreground">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => dismiss(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
