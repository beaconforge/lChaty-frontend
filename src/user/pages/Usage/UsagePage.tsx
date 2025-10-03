import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchUsageSummary } from '../../api/usage';
import { EmptyState } from '../../components/Shared/EmptyState';

export default function UsagePage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['usage-summary'], queryFn: () => fetchUsageSummary({}) });

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading usage analytics…</p>;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Usage analytics unavailable"
        description="We could not load your usage summary. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Usage insights</h1>
        <p className="text-sm text-muted-foreground">Track engagement trends across your household.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Messages today</p>
          <p className="text-3xl font-semibold">{data.totals.messagesToday}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Streak</p>
          <p className="text-3xl font-semibold">{data.totals.streak} days</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Time today</p>
          <p className="text-3xl font-semibold">{data.totals.minutesToday} min</p>
        </div>
      </section>
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Messages by day</h2>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.byDay}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="messages" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMessages)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
