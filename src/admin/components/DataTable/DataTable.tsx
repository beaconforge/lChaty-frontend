import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  VisibilityState,
  useReactTable,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table } from './Table';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import { Skeleton } from '../ui/skeleton';
import { useSelectionStore } from '../../state/useSelectionStore';
import { cn } from '../../lib/utils';

export interface DataTableProps<TData> {
  tableId: string;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  getRowId?: (originalRow: TData, index: number) => string;
  onPaginationChange: (next: { page: number; pageSize: number }) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  enableRowSelection?: boolean;
}

export function DataTable<TData>({
  tableId,
  columns,
  data,
  total,
  page,
  pageSize,
  isLoading,
  toolbar,
  emptyState,
  getRowId,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  manualSorting = true,
  manualFiltering = true,
  enableRowSelection,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const selectionStore = useSelectionStore();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection: {},
    },
    getRowId,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: updater => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      onSortingChange?.(next);
    },
    onColumnFiltersChange: updater => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(next);
      onColumnFiltersChange?.(next);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    enableSorting: true,
    manualSorting,
    manualFiltering,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection,
  });

  const rows = table.getRowModel().rows;
  const totalHeight = useMemo(() => rows.length * 52, [rows.length]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 52,
    getScrollElement: () => document.getElementById(`${tableId}-scroll-area`),
  });

  const virtualRows = rows.length ? virtualizer.getVirtualItems() : [];

  const handlePageChange = (nextPage: number) => onPaginationChange({ page: nextPage, pageSize });
  const handlePageSizeChange = (nextSize: number) => onPaginationChange({ page, pageSize: nextSize });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        tableId={tableId}
        table={table}
        toolbar={toolbar}
        enableRowSelection={enableRowSelection}
        onReset={() => {
          setSorting([]);
          setColumnFilters([]);
          setColumnVisibility({});
          setGlobalFilter('');
          selectionStore.clear(tableId);
        }}
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <div id={`${tableId}-scroll-area`} className="max-h-[600px] overflow-auto">
          <Table>
            <Table.Head>
              {table.getHeaderGroups().map(headerGroup => (
                <Table.Row key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Table.HeadCell key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.HeadCell>
                  ))}
                </Table.Row>
              ))}
            </Table.Head>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={columns.length}>
                    <div className="space-y-2 p-6">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-6 w-2/3" />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : rows.length ? (
                <div style={{ height: totalHeight }} className="relative">
                  <div
                    style={{ transform: `translateY(${virtualRows[0]?.start ?? 0}px)` }}
                    className="absolute left-0 right-0"
                  >
                    {virtualRows.map(virtualRow => {
                      const row = rows[virtualRow.index];
                      const isSelected = enableRowSelection
                        ? selectionStore.selectedIds[tableId]?.has(row.id)
                        : false;
                      return (
                        <Table.Row
                          key={row.id}
                          data-index={virtualRow.index}
                          className={cn(isSelected && 'bg-primary/5')}
                          onClick={() => {
                            if (!enableRowSelection) return;
                            if (isSelected) {
                              selectionStore.deselect(tableId, row.id);
                            } else {
                              selectionStore.select(tableId, row.id);
                            }
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <Table.Cell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={columns.length}>
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {emptyState ?? 'No data available.'}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
