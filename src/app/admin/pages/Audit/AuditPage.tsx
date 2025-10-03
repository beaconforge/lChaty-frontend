import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { listAuditEvents, exportAudit } from '../../api/audit';
import { AuditEvent } from '../../api/types';
import { DataTable } from '../../components/DataTable/DataTable';
import { Toolbar } from '../../components/Toolbar';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';
import { Button } from '../../components/ui/button';
import { subscribeToAdminEvents } from '../../api/events';
import { useToast } from '../../components/ui/toast';

const columns: ColumnDef<AuditEvent>[] = [
  { accessorKey: 'createdAt', header: 'Timestamp', cell: ({ getValue }) => new Date(String(getValue())).toLocaleString() },
  { accessorKey: 'actor', header: 'Actor' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'resource', header: 'Resource' },
];

export function AuditPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [range, setRange] = useState<DateRange>({});
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['audit', page, pageSize, range],
    queryFn: () => listAuditEvents({ page, limit: pageSize, from: range.from, to: range.to }),
  });

  useEffect(() => {
    const unsubscribe = subscribeToAdminEvents(event => {
      if (event.type === 'audit.event') {
        setEvents(prev => [event.payload as AuditEvent, ...prev].slice(0, 20));
      }
    });
    return unsubscribe;
  }, []);

  const combinedData = useMemo(() => {
    const liveIds = new Set(events.map(item => item.id));
    const base = query.data?.data ?? [];
    const filteredBase = base.filter(item => !liveIds.has(item.id));
    return [...events, ...filteredBase];
  }, [events, query.data?.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Audit log</h1>
          <p className="text-sm text-muted-foreground">Compliance-grade record of privileged actions.</p>
        </div>
        <Toolbar>
          <DateRangePicker value={range} onChange={setRange} />
          <Button
            variant="outline"
            onClick={async () => {
              const blob = await exportAudit({ from: range.from, to: range.to });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'audit.csv';
              link.click();
              URL.revokeObjectURL(url);
              toast({ title: 'Export started', description: 'Audit CSV has been downloaded.' });
            }}
          >
            Export CSV
          </Button>
        </Toolbar>
      </div>
      <DataTable
        tableId="audit"
        columns={columns}
        data={combinedData}
        total={query.data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={query.isLoading}
        onPaginationChange={({ page: nextPage, pageSize: nextSize }) => {
          setPage(nextPage);
          setPageSize(nextSize);
        }}
        toolbar={null}
      />
    </div>
  );
}
