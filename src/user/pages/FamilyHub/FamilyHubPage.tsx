import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFamily } from '../../api/family';
import { useFamilyStore } from '../../state/useFamilyStore';
import { FamilyCard } from '../../components/Family/FamilyCard';
import { ChildProfileCard } from '../../components/Family/ChildProfileCard';
import { ScheduleGrid } from '../../components/Family/ScheduleGrid';
import { EmptyState } from '../../components/Shared/EmptyState';

export default function FamilyHubPage() {
  const { data, isLoading } = useQuery({ queryKey: ['family'], queryFn: () => fetchFamily() });
  const setHousehold = useFamilyStore(state => state.setHousehold);

  useEffect(() => {
    if (data) {
      setHousehold(data);
    }
  }, [data, setHousehold]);

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading household…</p>;
  }

  if (!data) {
    return <EmptyState title="Family hub not enabled" description="Connect your household to access family controls." />;
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Family hub</h1>
        <p className="text-sm text-muted-foreground">
          Manage kid safety settings, approve requests, and monitor usage in one place.
        </p>
      </header>
      <FamilyCard family={data} />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.children.map(child => (
          <ChildProfileCard key={child.id} child={child} />
        ))}
      </div>
      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold">Weekly schedule</h2>
        <p className="text-sm text-muted-foreground">Configure study time and quiet hours.</p>
        <div className="mt-4 overflow-x-auto">
          <ScheduleGrid value={{ Mon: 'Study 5-7 PM', Tue: 'Free play', Wed: 'Homework 4-6 PM' }} />
        </div>
      </section>
    </div>
  );
}
