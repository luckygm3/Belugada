import { Skeleton, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="overflow-hidden rounded-pa-lg border border-border bg-surface shadow-pa-sm">
        <table className="w-full">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} colunas={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
