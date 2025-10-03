import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: Props) {
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="mb-3">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea value={value} onChange={event => onChange(event.target.value)} rows={12} />
      </TabsContent>
      <TabsContent value="preview">
        <div className="prose max-w-none rounded-md border bg-card p-4 text-sm dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '_Nothing to preview yet._'}</ReactMarkdown>
        </div>
      </TabsContent>
    </Tabs>
  );
}
