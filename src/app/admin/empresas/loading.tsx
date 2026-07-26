import { Skeleton, SkeletonStatCard, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-36 rounded-pa-md" />
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
              <SkeletonTableRow key={i} colunas={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
