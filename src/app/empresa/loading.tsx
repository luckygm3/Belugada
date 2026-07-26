import { Skeleton, SkeletonStatCard, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-48 rounded-pa-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="overflow-hidden rounded-pa-lg border border-border bg-surface shadow-pa-sm">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} colunas={4} />
            ))}
          </tbody>
        </table>
      </div>

      <Skeleton className="h-20 w-full rounded-pa-lg" />
    </div>
  );
}
