export type ToastVariant = 'default' | 'destructive' | 'success';

export type ToastProps = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};
