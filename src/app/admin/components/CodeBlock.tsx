import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { useToast } from './ui/toast';

export function CodeBlock({ value }: { value: string }) {
  const { toast } = useToast();

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    toast({ title: 'Copied to clipboard', description: 'Snippet copied successfully', variant: 'success' });
  };

  return (
    <div className="relative rounded-lg border bg-muted/50 p-4 font-mono text-xs">
      <Button size="sm" variant="ghost" className="absolute right-2 top-2" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
      <pre className="overflow-x-auto text-xs leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
}
