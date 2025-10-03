import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

export function Copyable({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="gap-2"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="truncate text-xs">{value}</span>
    </Button>
  );
}
