import type { Message } from '../../api/types';
import { Avatar } from '../Shared/Avatar';
import { Markdown } from '../Shared/Markdown';
import { InlineTools } from './InlineTools';
import { Citations } from './Citations';
import { cn } from '../../utils/cn';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.author.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse text-right' : 'flex-row text-left')}>
      <Avatar name={message.author.name} src={message.author.avatarUrl} size="sm" />
      <div className={cn('max-w-2xl space-y-2', isUser ? 'items-end text-right' : 'items-start text-left')}>
        <div
          className={cn(
            'rounded-2xl border px-4 py-3 text-sm shadow-sm',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground',
          )}
        >
          <Markdown content={message.content} />
        </div>
        {message.citations?.length ? <Citations citations={message.citations} /> : null}
        <InlineTools message={message} />
      </div>
    </div>
  );
}
