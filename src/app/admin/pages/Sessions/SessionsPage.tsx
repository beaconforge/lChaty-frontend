import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listSessions, terminateSession } from '../../api/sessions';
import { Session } from '../../api/types';
import { DataTable } from '../../components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';

const columns: ColumnDef<Session>[] = [
  { accessorKey: 'id', header: 'Session' },
  { accessorKey: 'ipAddress', header: 'IP address' },
  { accessorKey: 'userAgent', header: 'User agent', cell: ({ getValue }) => <span className="truncate text-xs">{String(getValue() ?? 'Unknown')}</span> },
  { accessorKey: 'lastSeenAt', header: 'Last seen', cell: ({ getValue }) => new Date(String(getValue())).toLocaleString() },
];

export function SessionsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sessions', page, pageSize],
    queryFn: () => listSessions({ page, limit: pageSize }),
  });

  const mutation = useMutation({
    mutationFn: (sessionId: string) => terminateSession(sessionId),
    onSuccess: () => {
      toast({ title: 'Session terminated' });
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Active sessions</h1>
          <p className="text-sm text-muted-foreground">Terminate risky devices or review login activity.</p>
        </div>
        <Button
          variant="outline"
          disabled={!query.data?.data?.length}
          onClick={() => query.data?.data?.[0] && mutation.mutate(query.data?.data?.[0].id)}
        >
          Terminate first session
        </Button>
      </div>
      <DataTable
        tableId="sessions"
        columns={columns}
        data={query.data?.data ?? []}
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
