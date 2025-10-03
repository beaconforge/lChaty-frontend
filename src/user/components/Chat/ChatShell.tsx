import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function ChatShell({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-1 flex-col lg:flex-row">
      <aside className={cn('w-full border-b lg:w-72 lg:border-b-0 lg:border-r')}>{left}</aside>
      <main className="flex min-h-[60vh] flex-1 flex-col bg-background">{center}</main>
      <section className="hidden w-full max-w-sm border-l lg:block">{right}</section>
    </div>
  );
}
