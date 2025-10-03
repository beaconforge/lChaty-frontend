import { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Toolbar({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>;
}
