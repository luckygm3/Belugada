import { Skeleton } from "@/components/ui/Skeleton";

function CampoSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-full rounded-pa-md" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl items-start gap-6">
      <div className="max-w-2xl flex-1 space-y-6">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-3 h-2 w-full rounded-pa-full" />
        </div>

        <div className="space-y-4 rounded-pa-lg border border-border bg-surface p-6 shadow-pa-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <CampoSkeleton key={i} />
          ))}
        </div>
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="space-y-3 rounded-pa-lg border border-border bg-surface p-4 shadow-pa-sm">
          <Skeleton className="h-4 w-16" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </aside>
    </div>
  );
}
