import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../../api/profile';
import { EmptyState } from '../../components/Shared/EmptyState';

export default function ProfilePage() {
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => fetchProfile() });

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading profile…</p>;
  }

  if (!data) {
    return <EmptyState title="No profile" description="We could not load your profile information." />;
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </header>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Username</dt>
            <dd className="text-lg font-semibold">{data.username}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Roles</dt>
            <dd className="text-lg font-semibold">{data.roles.join(', ')}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
