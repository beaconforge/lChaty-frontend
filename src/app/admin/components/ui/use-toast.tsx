import { createContext, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { ToastProps } from './toast-types';

const ToastContext = createContext<{
  toasts: ToastProps[];
  toast: (toast: Omit<ToastProps, 'id'> & { id?: string }) => void;
  dismiss: (id: string) => void;
} | null>(null);

export function ToastProviderInternal({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (data: Omit<ToastProps, 'id'> & { id?: string }) => {
    const id = data.id ?? nanoid();
    const toastPayload: ToastProps = { duration: 5000, variant: 'default', ...data, id };
    setToasts(current => [...current, toastPayload]);
    if (toastPayload.duration) {
      window.setTimeout(() => dismiss(id), toastPayload.duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  };

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastController() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('Toast context missing');
  }
  return { toast: ctx.toast, dismiss: ctx.dismiss };
}

export function useToastState() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('Toast context missing');
  }
  return ctx.toasts;
}
