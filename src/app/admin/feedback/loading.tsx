import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="space-y-3">
        <SkeletonCard linhas={2} />
        <SkeletonCard linhas={2} />
        <SkeletonCard linhas={2} />
      </div>
    </div>
  );
}
