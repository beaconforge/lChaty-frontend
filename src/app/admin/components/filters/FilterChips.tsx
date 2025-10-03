import { X } from 'lucide-react';
import { Button } from '../ui/button';

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

export function FilterChips({ filters }: { filters: ActiveFilter[] }) {
  if (!filters.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(filter => (
        <Button key={filter.key} variant="outline" size="sm" onClick={filter.onRemove}>
          {filter.label}
          <X className="ml-2 h-3 w-3" />
        </Button>
      ))}
    </div>
  );
}
