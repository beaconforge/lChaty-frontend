import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { listOrgs } from '../../api/orgs';
import { DataTable } from '../../components/DataTable/DataTable';
import { Toolbar } from '../../components/Toolbar';
import { Input } from '../../components/ui/input';

interface OrgRow {
  id: string;
  name: string;
  domain?: string;
  createdAt: string;
}

const columns: ColumnDef<OrgRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'domain', header: 'Domain' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString() },
];

export function OrgsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ['orgs', page, pageSize, query],
    queryFn: () => listOrgs({ page, limit: pageSize, query: query || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground">Track enterprise accounts, owners, and billing relationships.</p>
        </div>
        <Toolbar>
          <Input placeholder="Search orgs" value={query} onChange={event => setQuery(event.target.value)} />
        </Toolbar>
      </div>
      <DataTable
        tableId="orgs"
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
