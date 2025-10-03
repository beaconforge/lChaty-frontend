import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{message ?? 'Loading...'}</p>
    </div>
  );
}
