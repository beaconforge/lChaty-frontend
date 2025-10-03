import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { listTeams } from '../../api/teams';
import { DataTable } from '../../components/DataTable/DataTable';
import { Input } from '../../components/ui/input';
import { Toolbar } from '../../components/Toolbar';

interface TeamRow {
  id: string;
  name: string;
  orgId: string;
  membersCount: number;
  createdAt: string;
}

const columns: ColumnDef<TeamRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'orgId', header: 'Org' },
  { accessorKey: 'membersCount', header: 'Members' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString() },
];

export function TeamsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ['teams', page, pageSize, query],
    queryFn: () => listTeams({ page, limit: pageSize, query: query || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-sm text-muted-foreground">Organize users into collaboration groups and assign entitlements.</p>
        </div>
        <Toolbar>
          <Input placeholder="Search teams" value={query} onChange={event => setQuery(event.target.value)} />
        </Toolbar>
      </div>
      <DataTable
        tableId="teams"
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPaginationChange={({ page: nextPage, pageSize: nextSize }) => {
          setPage(nextPage);
          setPageSize(nextSize);
        }}
        toolbar={null}
      />
    </div>
  );
}
