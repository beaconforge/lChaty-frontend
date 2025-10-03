import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { listUsers, resetPassword } from '../../api/users';
import { AdminUser } from '../../api/types';
import { DataTable } from '../../components/DataTable/DataTable';
import { Toolbar } from '../../components/Toolbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CSVExport } from '../../components/CSVExport';
import { useToast } from '../../components/ui/toast';
import { StatusPill } from '../../components/StatusPill';
import { UserAvatar } from '../../components/UserAvatar';

const columns: ColumnDef<AdminUser>[] = [
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <UserAvatar name={row.original.name} email={row.original.email} />
        <div>
          <div className="font-medium">{row.original.username}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusPill status={String(getValue() ?? 'unknown')} />,
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{(getValue() as string[]).join(', ')}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleString(),
  },
];

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, query, status],
    queryFn: async () =>
      listUsers({ page, limit: pageSize, query: query || undefined, status: status || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage account status, roles, and invitations.</p>
        </div>
        <Toolbar>
          <Input placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} />
          <Select value={status} onValueChange={value => setStatus(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <CSVExport filename="users.csv" rows={data?.data ?? []} />
          <Button
            variant="outline"
            onClick={() => {
              toast({ title: 'Bulk action queued', description: 'Reset password emails will be sent shortly.' });
              (data?.data ?? []).forEach(user => {
                void resetPassword(user.id);
              });
            }}
          >
            Reset all passwords
          </Button>
        </Toolbar>
      </div>
      <DataTable
        tableId="users"
        data={data?.data ?? []}
        columns={columns}
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
