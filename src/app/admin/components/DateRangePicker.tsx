import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';

export interface DateRange {
  from?: string;
  to?: string;
}

interface Props {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: Props) {
  const label = useMemo(() => {
    if (!value.from && !value.to) return 'All time';
    const from = value.from ? format(parseISO(value.from), 'MMM d, yyyy') : '…';
    const to = value.to ? format(parseISO(value.to), 'MMM d, yyyy') : '…';
    return `${from} – ${to}`;
  }, [value.from, value.to]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <Input
                type="date"
                value={value.from ? value.from.slice(0, 10) : ''}
                onChange={event => onChange({ ...value, from: event.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <Input
                type="date"
                value={value.to ? value.to.slice(0, 10) : ''}
                onChange={event => onChange({ ...value, to: event.target.value || undefined })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <Button variant="ghost" size="sm" onClick={() => onChange({})}>
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                onChange({ from: from.toISOString(), to: now.toISOString() });
              }}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                onChange({ from: from.toISOString(), to: now.toISOString() });
              }}
            >
              Last 30 days
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
