import { ChangeEvent } from 'react';
import { useToast } from '../../providers/ToastProvider';

const ACCEPTED_TYPES = ['image/*', 'application/pdf', 'text/markdown'];

export function AttachmentPicker({ onSelect }: { onSelect: (files: FileList) => void }) {
  const toast = useToast();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    onSelect(files);
    toast.push({ title: `${files.length} attachment${files.length > 1 ? 's' : ''} ready`, type: 'info' });
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
      <input
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleChange}
      />
      Attach
    </label>
  );
}
