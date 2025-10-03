import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listModerationReports, resolveModerationReport } from '../../api/moderation';
import { ModerationReport } from '../../api/types';
import { DataTable } from '../../components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';

const columns: ColumnDef<ModerationReport>[] = [
  { accessorKey: 'reason', header: 'Reason' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'reporter', header: 'Reporter' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => new Date(String(getValue())).toLocaleString() },
];

export function ModerationPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['moderation', page, pageSize],
    queryFn: () => listModerationReports({ page, limit: pageSize }),
  });

  const mutation = useMutation({
    mutationFn: (reportId: string) => resolveModerationReport(reportId, { action: 'dismiss' }),
    onSuccess: () => {
      toast({ title: 'Report resolved' });
      void queryClient.invalidateQueries({ queryKey: ['moderation'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Moderation queue</h1>
          <p className="text-sm text-muted-foreground">Review reports and enforce community standards.</p>
        </div>
        <Button
          variant="outline"
          disabled={!query.data?.data?.length}
          onClick={() => query.data?.data?.[0] && mutation.mutate(query.data?.data?.[0].id)}
        >
          Resolve first report
        </Button>
      </div>
      <DataTable
        tableId="moderation"
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
