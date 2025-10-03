import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBillingSummary, fetchInvoices } from '../../api/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DataTable } from '../../components/DataTable/DataTable';

interface InvoiceRow {
  id: string;
  amount: number;
  status: string;
  issuedAt: string;
}

const invoiceColumns = [
  { accessorKey: 'id', header: 'Invoice' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }: any) => `$${(Number(getValue()) / 100).toFixed(2)}` },
  { accessorKey: 'issuedAt', header: 'Issued', cell: ({ getValue }: any) => new Date(String(getValue())).toLocaleDateString() },
];

export function BillingPage() {
  const [orgId, setOrgId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const summaryQuery = useQuery({
    queryKey: ['billing-summary', orgId],
    queryFn: () => fetchBillingSummary({ orgId }),
  });

  const invoicesQuery = useQuery({
    queryKey: ['billing-invoices', orgId, page, pageSize],
    queryFn: () => fetchInvoices({ orgId, page, limit: pageSize }),
  });

  const summary = summaryQuery.data ?? { totalDue: 0, creditBalance: 0, nextInvoice: null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing overview</h1>
        <p className="text-sm text-muted-foreground">Read-only view of invoices and payment standing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total due</CardDescription>
            <CardTitle>${(summary.totalDue / 100).toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Credit balance</CardDescription>
            <CardTitle>${(summary.creditBalance / 100).toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Next invoice</CardDescription>
            <CardTitle>{summary.nextInvoice ? new Date(summary.nextInvoice).toLocaleDateString() : 'TBD'}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            tableId="invoices"
            columns={invoiceColumns as any}
            data={(invoicesQuery.data?.data as InvoiceRow[]) ?? []}
            total={invoicesQuery.data?.total ?? 0}
            page={page}
            pageSize={pageSize}
            isLoading={invoicesQuery.isLoading}
            onPaginationChange={({ page: nextPage, pageSize: nextSize }) => {
              setPage(nextPage);
              setPageSize(nextSize);
            }}
            toolbar={null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
