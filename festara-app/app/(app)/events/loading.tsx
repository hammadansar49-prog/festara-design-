import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Loading your events">
      <Skeleton className="h-16 w-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-[28px]" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-[24px]" />)}
      </div>
    </div>
  );
}
