import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createThread, sendMessage } from '../../api/chat';
import { useChatStore } from '../../state/useChatStore';
import { SuggestionChips } from './SuggestionChips';
import { AttachmentPicker } from './AttachmentPicker';
import { useToast } from '../../providers/ToastProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const composerSchema = z.object({
  text: z
    .string()
    .min(1, 'Please enter a message')
    .max(4000, 'Messages are limited to 4000 characters'),
});

type ComposerValues = z.infer<typeof composerSchema>;

const DEFAULT_SUGGESTIONS = ['Summarize this', 'Explain step by step', 'Give me action items'];

export function Composer() {
  const threadId = useChatStore(state => state.currentThreadId);
  const setCurrentThread = useChatStore(state => state.setCurrentThread);
  const setDraftText = useChatStore(state => state.setDraftText);
  const { register, handleSubmit, reset, formState, setValue, watch } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: { text: '' },
  });
  const queryClient = useQueryClient();
  const toast = useToast();
  const textValue = watch('text');

  const createThreadMutation = useMutation({
    mutationFn: () => createThread({}),
    onSuccess: async result => {
      setCurrentThread(result.id);
      await queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => sendMessage(id, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const newThread = await createThreadMutation.mutateAsync();
        activeThreadId = newThread.id;
      }
      if (!activeThreadId) {
        throw new Error('No conversation available.');
      }
      await sendMutation.mutateAsync({ id: activeThreadId, text: values.text });
      reset({ text: '' });
      setDraftText(activeThreadId, '');
    } catch (error) {
      toast.push({ title: 'Failed to send message', description: (error as Error).message, type: 'error' });
    }
  });

  return (
    <form
      className="space-y-3 border-t bg-background p-4"
      onSubmit={onSubmit}
    >
      <textarea
        {...register('text')}
        rows={3}
        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        placeholder="Send a message"
        onChange={event => {
          register('text').onChange(event);
          if (threadId) setDraftText(threadId, event.target.value);
        }}
        aria-label="Message composer"
      />
      {formState.errors.text ? (
        <p className="text-xs text-destructive">{formState.errors.text.message}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AttachmentPicker onSelect={() => {}} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setValue('text', `${textValue}\n/summary `)}
            className="rounded-md border border-input px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
          >
            /Commands
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
            disabled={formState.isSubmitting || sendMutation.isPending}
          >
            Send
          </button>
        </div>
      </div>
      <SuggestionChips suggestions={DEFAULT_SUGGESTIONS} onSelect={value => setValue('text', `${textValue}\n${value}`)} />
    </form>
  );
}
