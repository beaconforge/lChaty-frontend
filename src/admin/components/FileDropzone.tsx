import { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => void;
}

export function FileDropzone({ onFiles }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={event => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground transition ${dragging ? 'border-primary bg-primary/5 text-primary' : ''}`}
    >
      <UploadCloud className="mb-2 h-6 w-6" />
      <p>Drag and drop files here, or click to browse</p>
      <input
        type="file"
        multiple
        className="hidden"
        onChange={event => {
          const files = event.target.files ? Array.from(event.target.files) : [];
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}
