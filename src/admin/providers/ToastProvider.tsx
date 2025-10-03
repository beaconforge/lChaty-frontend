import { PropsWithChildren } from 'react';
import { ToastProviderInternal } from '../components/ui/use-toast';
import { ToastList } from '../components/ui/toaster';

export function ToastProvider({ children }: PropsWithChildren) {
  return (
    <ToastProviderInternal>
      {children}
      <ToastList />
    </ToastProviderInternal>
  );
}
