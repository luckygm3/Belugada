import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-pa-lg border border-border bg-surface p-6 shadow-pa-sm">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-28 w-full rounded-pa-lg" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-20 rounded-pa-md" />
        <Skeleton className="h-9 w-32 rounded-pa-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-pa-lg border border-border bg-surface p-4 shadow-pa-sm">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
