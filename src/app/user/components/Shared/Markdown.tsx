import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { cn } from '../../utils/cn';

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <ReactMarkdown
      className={cn('prose max-w-none dark:prose-invert prose-pre:p-0', className)}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className: blockClassName, children, ...props }) {
          const match = /language-(\w+)/.exec(blockClassName ?? '');
          if (inline) {
            return (
              <code className="rounded bg-muted px-1 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock language={match?.[1]} value={String(children).replace(/\n$/, '')} />;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          return (
            <img
              src={src ?? ''}
              alt={alt ?? ''}
              className="max-h-64 w-full rounded-lg object-contain"
              loading="lazy"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
