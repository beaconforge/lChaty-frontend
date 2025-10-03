import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const STATUS_STYLES: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  active: { variant: 'default', className: 'bg-green-500/10 text-green-600 dark:text-green-300' },
  pending: { variant: 'secondary' },
  disabled: { variant: 'destructive' },
  error: { variant: 'destructive' },
  success: { variant: 'default', className: 'bg-green-500/10 text-green-600 dark:text-green-300' },
};

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] ?? { variant: 'outline' as const };
  return (
    <Badge variant={style.variant} className={cn('capitalize', style.className)}>
      {status}
    </Badge>
  );
}
