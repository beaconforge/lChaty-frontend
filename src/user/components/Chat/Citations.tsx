export function Citations({ citations }: { citations: Array<{ id: string; title: string; url: string }> }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {citations.map(citation => (
        <a
          key={citation.id}
          href={citation.url}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-primary/30 px-3 py-1 text-primary hover:bg-primary/10"
        >
          {citation.title}
        </a>
      ))}
    </div>
  );
}
