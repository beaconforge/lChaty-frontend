import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listTickets, replyToTicket } from '../../api/support';
import { SupportTicket } from '../../api/types';
import { DataTable } from '../../components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/toast';
import { LoadingScreen } from '../../components/LoadingScreen';

const columns: ColumnDef<SupportTicket>[] = [
  { accessorKey: 'subject', header: 'Subject' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'requester', header: 'Requester' },
  { accessorKey: 'updatedAt', header: 'Updated', cell: ({ getValue }) => new Date(String(getValue())).toLocaleString() },
];

export function SupportPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['support', page, pageSize],
    queryFn: () => listTickets({ page, limit: pageSize }),
  });

  const mutation = useMutation({
    mutationFn: () => replyToTicket(selectedTicket!.id, { message: reply }),
    onSuccess: () => {
      toast({ title: 'Reply sent' });
      setSelectedTicket(null);
      setReply('');
      void queryClient.invalidateQueries({ queryKey: ['support'] });
    },
  });

  if (query.isLoading) {
    return <LoadingScreen message="Loading support tickets" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Support tickets</h1>
        <p className="text-sm text-muted-foreground">Respond to customer issues and review history.</p>
      </div>
      <DataTable
        tableId="support"
        columns={columns}
        data={query.data?.data ?? []}
        total={query.data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPaginationChange={({ page: nextPage, pageSize: nextSize }) => {
          setPage(nextPage);
          setPageSize(nextSize);
        }}
        toolbar={null}
        isLoading={query.isLoading}
      />
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={!query.data?.data?.length}
          onClick={() => setSelectedTicket(query.data?.data?.[0] ?? null)}
        >
          Reply to first ticket
        </Button>
      </div>
      <Dialog open={!!selectedTicket} onOpenChange={open => (!open ? setSelectedTicket(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <Textarea value={reply} onChange={event => setReply(event.target.value)} rows={6} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : 'Send reply'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
