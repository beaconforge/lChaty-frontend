import { Skeleton } from './ui/skeleton';

export function SkeletonTable() {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {[...Array(5)].map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
