import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsage } from '../../api/usage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DateRangePicker, DateRange } from '../../components/DateRangePicker';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Skeleton } from '../../components/ui/skeleton';

export function UsagePage() {
  const [range, setRange] = useState<DateRange>({});
  const { data, isLoading } = useQuery({
    queryKey: ['usage-detail', range],
    queryFn: () => fetchUsage({ from: range.from, to: range.to, granularity: 'day' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usage analytics</h1>
          <p className="text-sm text-muted-foreground">Slice and export platform usage by date range.</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Messages vs active users</CardTitle>
          <CardDescription>Correlate user engagement with throughput.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.data ?? []}>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="activeUsers" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
