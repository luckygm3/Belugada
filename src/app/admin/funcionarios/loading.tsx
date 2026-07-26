import { Skeleton, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      <div className="overflow-hidden rounded-pa-lg border border-border bg-surface shadow-pa-sm">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTableRow key={i} colunas={4} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
