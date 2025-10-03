import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTeam } from '../../api/teams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingScreen } from '../../components/LoadingScreen';

export function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id!;

  const { data, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeam(teamId),
  });

  if (isLoading || !data) {
    return <LoadingScreen message="Loading team" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>Team ID {data.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Organization</div>
              <div className="font-medium">{data.orgId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Members</div>
              <div className="font-medium">{data.membersCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(data.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
