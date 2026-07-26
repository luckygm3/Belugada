import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-44" />
      <div className="max-w-3xl space-y-8">
        <SkeletonCard linhas={4} />
        <SkeletonCard linhas={2} />
        <SkeletonCard linhas={3} />
        <SkeletonCard linhas={3} />
        <SkeletonCard linhas={2} />
      </div>
    </div>
  );
}
