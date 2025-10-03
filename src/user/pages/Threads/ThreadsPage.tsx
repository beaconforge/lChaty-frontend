import { useQuery } from '@tanstack/react-query';
import { listThreads } from '../../api/chat';
import type { ThreadSummary } from '../../api/types';
import { EmptyState } from '../../components/Shared/EmptyState';

export default function ThreadsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['threads'], queryFn: () => listThreads() });

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading threads…</p>;
  }

  if (!data?.length) {
    return <EmptyState title="No threads" description="You have not created any conversations yet." />;
  }

  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">All conversations</h1>
        <p className="text-sm text-muted-foreground">Search and manage every thread in your workspace.</p>
      </header>
      <ul className="space-y-3">
        {data.map((thread: ThreadSummary) => (
          <li key={thread.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold">{thread.title || 'Untitled conversation'}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(thread.updatedAt).toLocaleString()}</p>
              </div>
              {thread.pinned ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Pinned</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
