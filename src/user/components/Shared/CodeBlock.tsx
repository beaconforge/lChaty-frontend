import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism.min.css';

export function CodeBlock({ language, value }: { language?: string; value: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current);
    }
  }, [value]);

  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm" tabIndex={0}>
      <code ref={ref} className={`language-${language ?? 'tsx'}`}>
        {value}
      </code>
    </pre>
  );
}
