import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsage } from '../../api/usage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';
import { Skeleton } from '../../components/ui/skeleton';

const rangeOptions: Record<string, () => DateRange> = {
  '7d': () => {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  },
  '30d': () => {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  },
};

export function DashboardPage() {
  const [range, setRange] = useState<DateRange>(rangeOptions['7d']());

  const { data, isLoading } = useQuery({
    queryKey: ['usage', range],
    queryFn: async () => fetchUsage({ from: range.from, to: range.to, granularity: 'day' }),
  });

  const metrics = useMemo(() => {
    const series = data?.data ?? [];
    const totalMessages = series.reduce((acc, item) => acc + item.messages, 0);
    const activeUsers = series.reduce((acc, item) => acc + item.activeUsers, 0);
    return { totalMessages, activeUsers, samples: series.length };
  }, [data?.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Operations dashboard</h1>
          <p className="text-sm text-muted-foreground">Realtime signal across usage, growth, and platform health.</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Messages processed</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalMessages.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active users</CardDescription>
            <CardTitle className="text-2xl">{metrics.activeUsers.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Data points</CardDescription>
            <CardTitle className="text-2xl">{metrics.samples}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>On-call status</CardDescription>
            <CardTitle className="text-2xl text-green-500">Healthy</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card className="h-[360px]">
        <CardHeader>
          <CardTitle>Usage trend</CardTitle>
          <CardDescription>Daily messages delivered and active accounts</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.data ?? []}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="messages" stroke="#4f46e5" fill="url(#colorMessages)" />
                <Area type="monotone" dataKey="activeUsers" stroke="#10b981" fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
