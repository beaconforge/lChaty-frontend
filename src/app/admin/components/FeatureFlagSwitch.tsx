import { useState } from 'react';
import { Switch } from './ui/switch';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  flagKey: string;
  enabled: boolean;
  onChange: (enabled: boolean, note?: string) => Promise<void> | void;
}

export function FeatureFlagSwitch({ flagKey, enabled, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(enabled);
  const [note, setNote] = useState('');

  return (
    <div>
      <Switch
        checked={enabled}
        onCheckedChange={value => {
          setPendingValue(value);
          setOpen(true);
        }}
      />
      <ConfirmDialog
        open={open}
        title={`Confirm ${pendingValue ? 'enable' : 'disable'} ${flagKey}`}
        description="Add an optional audit note before applying this change."
        onCancel={() => {
          setOpen(false);
          setNote('');
        }}
        onConfirm={() => {
          void onChange(pendingValue, note);
          setOpen(false);
          setNote('');
        }}
        footer={
          <textarea
            className="w-full rounded-md border bg-muted/20 p-2 text-sm"
            placeholder="Audit note"
            value={note}
            onChange={event => setNote(event.target.value)}
          />
        }
      />
    </div>
  );
}
