import { SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl space-y-6">
      <SkeletonCard linhas={6} />
      <SkeletonCard linhas={3} />
      <SkeletonCard linhas={2} />
      <SkeletonCard linhas={4} />
      <SkeletonCard linhas={3} />
      <SkeletonCard linhas={3} />
    </div>
  );
}
