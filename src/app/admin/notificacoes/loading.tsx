import { Skeleton, SkeletonTableRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      <div className="flex flex-wrap items-end gap-4 rounded-pa-lg border border-border bg-surface p-4 shadow-pa-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-36 rounded-pa-md" />
          </div>
        ))}
      </div>

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
