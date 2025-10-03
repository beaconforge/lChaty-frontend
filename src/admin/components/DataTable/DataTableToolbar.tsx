import { Table as TableType } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Settings, Filter, Columns3 } from 'lucide-react';

interface Props<TData> {
  tableId: string;
  table: TableType<TData>;
  toolbar?: React.ReactNode;
  enableRowSelection?: boolean;
  onReset: () => void;
}

export function DataTableToolbar<TData>({ tableId, table, toolbar, enableRowSelection, onReset }: Props<TData>) {
  const state = table.getState();
  const selectionCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <Input
          value={state.globalFilter ?? ''}
          onChange={event => table.setGlobalFilter(event.target.value)}
          placeholder="Search..."
          className="w-full max-w-xs"
        />
        {toolbar}
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table.getAllLeafColumns().map(column => (
              <DropdownMenuItem
                key={column.id}
                className="flex items-center justify-between gap-2"
                onSelect={event => {
                  event.preventDefault();
                  column.toggleVisibility();
                }}
              >
                <span>{column.columnDef.meta?.label ?? column.id}</span>
                <span className="text-xs text-muted-foreground">{column.getIsVisible() ? 'Hide' : 'Show'}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={onReset}>
          <Settings className="mr-2 h-4 w-4" /> Reset
        </Button>
        {enableRowSelection ? (
          <Button variant="outline" size="sm">
            <Columns3 className="mr-2 h-4 w-4" /> {selectionCount} selected
          </Button>
        ) : null}
      </div>
    </div>
  );
}
