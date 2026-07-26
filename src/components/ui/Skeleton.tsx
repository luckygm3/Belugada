"use client";

import { motion, useReducedMotion } from "motion/react";

export interface SkeletonProps {
  className?: string;
}

/**
 * Placeholder cinza com pulso — bloco de base, dimensionado via `className`
 * (altura/largura/arredondamento) por quem usa. Sob `prefers-reduced-motion`,
 * fica parado (mesma postura do Spinner/ProgressBar).
 */
export function Skeleton({ className }: SkeletonProps) {
  const reduzMovimento = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`rounded-pa-md bg-slate-200 dark:bg-slate-700 ${className ?? ""}`}
      animate={reduzMovimento ? undefined : { opacity: [0.6, 1, 0.6] }}
      transition={reduzMovimento ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** Empilha `linhas` de texto — a última fica mais curta, imitando o fim natural de um parágrafo/rótulo. */
export function SkeletonText({ linhas = 1, className }: { linhas?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === linhas - 1 && linhas > 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** Mesma forma do `StatCard` (ícone 40px + rótulo + valor) — usado nos dashboards/listagens que abrem com uma fileira de estatísticas. */
export function SkeletonStatCard() {
  return (
    <div className="flex items-start gap-4 rounded-pa-lg border border-border bg-surface p-5 shadow-pa-sm">
      <Skeleton className="h-10 w-10 shrink-0 rounded-pa-md" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-2 h-7 w-12" />
      </div>
    </div>
  );
}

/** Uma linha de `<table>` com `colunas` células — combine com o `<thead>` real da tabela final pra não deslocar o cabeçalho. */
export function SkeletonTableRow({ colunas = 4 }: { colunas?: number }) {
  return (
    <tr className="border-t border-border">
      {Array.from({ length: colunas }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-40" />
        </td>
      ))}
    </tr>
  );
}

/** Card genérico (borda + fundo iguais ao `Card` real) com um título e N linhas de conteúdo — pra seções tipo "card com campos". */
export function SkeletonCard({ linhas = 3, className }: { linhas?: number; className?: string }) {
  return (
    <div className={`rounded-pa-lg border border-border bg-surface p-6 ${className ?? ""}`}>
      <Skeleton className="h-5 w-40" />
      <div className="mt-4">
        <SkeletonText linhas={linhas} />
      </div>
    </div>
  );
}
