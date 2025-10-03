import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createThread, listThreads } from '../../api/chat';
import { useChatStore } from '../../state/useChatStore';
import { EmptyState } from '../Shared/EmptyState';
import { cn } from '../../utils/cn';
import { useToast } from '../../providers/ToastProvider';

export function ConversationList() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['threads'], queryFn: () => listThreads() });
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const setCurrentThread = useChatStore(state => state.setCurrentThread);

  const createThreadMutation = useMutation({
    mutationFn: () => createThread({}),
    onSuccess: async result => {
      await queryClient.invalidateQueries({ queryKey: ['threads'] });
      setCurrentThread(result.id);
    },
    onError: error => {
      toast.push({ title: 'Unable to create conversation', description: (error as Error).message, type: 'error' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-2 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-md bg-muted/60" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex h-full flex-col">
        <EmptyState title="No conversations yet" description="Start a new chat to see it here." />
        <div className="mt-auto border-t p-3">
          <button
            type="button"
            onClick={() => createThreadMutation.mutate()}
            className="w-full rounded-md border border-dashed border-primary/50 px-3 py-2 text-sm text-primary hover:bg-primary/10"
          >
            + New conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <nav aria-label="Conversations" className="flex h-full flex-col overflow-y-auto">
      <ul className="flex-1 space-y-1 p-2">
        {data.map(thread => (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => setCurrentThread(thread.id)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                currentThreadId === thread.id && 'bg-muted font-semibold',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{thread.title || 'Untitled conversation'}</span>
                {thread.pinned ? <span className="ml-2 text-xs text-primary">Pinned</span> : null}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                Updated {new Date(thread.updatedAt).toLocaleString()}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t p-3">
        <button
          type="button"
          onClick={() => createThreadMutation.mutate()}
          className="w-full rounded-md border border-dashed border-primary/50 px-3 py-2 text-sm text-primary hover:bg-primary/10"
          disabled={createThreadMutation.isPending}
        >
          + New conversation
        </button>
      </div>
    </nav>
  );
}
