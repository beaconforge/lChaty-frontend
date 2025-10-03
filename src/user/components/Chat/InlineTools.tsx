import type { Message } from '../../api/types';
import { useToast } from '../../providers/ToastProvider';

export function InlineTools({ message }: { message: Message }) {
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(message.content).then(() =>
            toast.push({ title: 'Copied to clipboard', type: 'success' }),
          );
        }}
        className="rounded-md border border-transparent px-2 py-1 hover:border-border"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={() => toast.push({ title: 'Coming soon', description: 'Edit & resend is in progress.', type: 'info' })}
        className="rounded-md border border-transparent px-2 py-1 hover:border-border"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => toast.push({ title: 'Retry requested', type: 'info' })}
        className="rounded-md border border-transparent px-2 py-1 hover:border-border"
      >
        Retry
      </button>
    </div>
  );
}
