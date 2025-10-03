import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMessages } from '../../api/chat';
import { useChatStore } from '../../state/useChatStore';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from '../Shared/EmptyState';
import { StreamingCursor } from './StreamingCursor';

export function MessageList() {
  const threadId = useChatStore(state => state.currentThreadId);
  const { data, isLoading } = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => (threadId ? fetchMessages(threadId) : Promise.resolve([])),
    enabled: Boolean(threadId),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [data?.length]);

  if (!threadId) {
    return <EmptyState title="Select a conversation" description="Choose a chat on the left or start a new one." />;
  }

  return (
    <div ref={containerRef} className="flex-1 space-y-6 overflow-y-auto p-4" aria-live="polite">
      {isLoading && <p className="text-sm text-muted-foreground">Loading messages…</p>}
      {data?.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <StreamingCursor />
    </div>
  );
}
