import { Skeleton, SkeletonStatCard, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36 rounded-pa-md" />
          <Skeleton className="h-9 w-48 rounded-pa-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard linhas={4} />
        <SkeletonCard linhas={2} />
      </div>

      <SkeletonCard linhas={1} className="h-48" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard linhas={4} />
        <SkeletonCard linhas={4} />
      </div>

      <SkeletonCard linhas={4} />
    </div>
  );
}
