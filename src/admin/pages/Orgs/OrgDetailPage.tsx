import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrg } from '../../api/orgs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingScreen } from '../../components/LoadingScreen';

export function OrgDetailPage() {
  const params = useParams();
  const orgId = params.id!;

  const { data, isLoading } = useQuery({
    queryKey: ['org', orgId],
    queryFn: () => getOrg(orgId),
  });

  if (isLoading || !data) {
    return <LoadingScreen message="Loading organization" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>Org ID {data.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Domain</div>
            <div className="font-medium">{data.domain ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Created</div>
            <div className="font-medium">{new Date(data.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Owner</div>
            <div className="font-medium">{data.ownerId ?? 'Unassigned'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
