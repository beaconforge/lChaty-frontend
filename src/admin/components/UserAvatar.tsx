import { UserRound } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  name?: string;
  email?: string;
  className?: string;
}

export function UserAvatar({ name, email, className }: Props) {
  const initials = (name ?? email ?? '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold', className)}>
      {initials ? initials : <UserRound className="h-4 w-4" />}
    </div>
  );
}
