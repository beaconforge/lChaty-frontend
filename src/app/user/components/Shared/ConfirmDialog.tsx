import { ReactNode, useId } from 'react';

type ConfirmDialogProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  trigger: ReactNode;
};

export function ConfirmDialog({ title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, trigger }: ConfirmDialogProps) {
  const dialogId = useId();

  return (
    <div className="inline">
      <label htmlFor={dialogId} className="inline">
        {trigger}
      </label>
      <input type="checkbox" id={dialogId} className="peer sr-only" />
      <div className="fixed inset-0 z-40 hidden items-center justify-center bg-black/50 p-4 peer-checked:flex">
        <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                const input = document.getElementById(dialogId) as HTMLInputElement | null;
                if (input) input.checked = false;
              }}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                const input = document.getElementById(dialogId) as HTMLInputElement | null;
                if (input) input.checked = false;
              }}
              className="rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
