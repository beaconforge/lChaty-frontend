import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listFeatureFlags, updateFeatureFlag } from '../../api/featureFlags';
import { FeatureFlagSwitch } from '../../components/FeatureFlagSwitch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../components/ui/toast';
import { Skeleton } from '../../components/ui/skeleton';

export function FeatureFlagsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['feature-flags'], queryFn: listFeatureFlags });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ key, enabled, note }: { key: string; enabled: boolean; note?: string }) =>
      updateFeatureFlag(key, { enabled, notes: note }),
    onSuccess: () => {
      toast({ title: 'Flag updated' });
      void queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Feature flags</h1>
        <p className="text-sm text-muted-foreground">Safely roll out and audit platform capabilities.</p>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          data?.data?.map(flag => (
            <Card key={flag.key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{flag.key}</CardTitle>
                  <CardDescription>{flag.description}</CardDescription>
                </div>
                <FeatureFlagSwitch
                  flagKey={flag.key}
                  enabled={flag.enabled}
                  onChange={(enabled, note) => mutation.mutate({ key: flag.key, enabled, note })}
                />
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Updated {flag.updatedAt ? new Date(flag.updatedAt).toLocaleString() : 'never'}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
