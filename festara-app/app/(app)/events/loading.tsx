import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Loading your events">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
      </div>
    </div>
  );
}
