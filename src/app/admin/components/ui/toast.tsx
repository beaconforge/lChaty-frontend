import { useToastController } from './use-toast';

export function useToast() {
  const { toast, dismiss } = useToastController();
  return { toast, dismiss };
}
