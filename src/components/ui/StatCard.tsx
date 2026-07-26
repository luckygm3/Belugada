import type { ReactNode } from "react";
import { Card } from "./Card";

export type TomStatCard = "navy" | "teal" | "warning" | "danger";

interface StatCardProps {
  rotulo: string;
  valor: string | number;
  icone: ReactNode;
  tom?: TomStatCard;
  className?: string;
}

const CLASSES_POR_TOM: Record<TomStatCard, string> = {
  navy: "bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-navy-200",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-900 dark:text-teal-200",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Card de resumo/estatística — usado no topo de dashboards e listagens. */
export function StatCard({ rotulo, valor, icone, tom = "navy", className }: StatCardProps) {
  return (
    <Card className={`flex items-start gap-4 p-5 ${className ?? ""}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pa-md ${CLASSES_POR_TOM[tom]}`}>
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-body-sm text-ink-muted">{rotulo}</p>
        <p className="mt-1 text-h2 text-ink">{valor}</p>
      </div>
    </Card>
  );
}
