"use client";

import { motion, useReducedMotion } from "motion/react";

export type ProgressBarVariant = "primary" | "success" | "danger";

export interface ProgressBarProps {
  /** 0-100. Ignorado quando `indeterminate` é true. */
  value?: number;
  /** Sem valor conhecido ainda (ex.: etapa de preparo antes de saber o total). */
  indeterminate?: boolean;
  variant?: ProgressBarVariant;
  className?: string;
  "aria-label"?: string;
}

const corPorVariante: Record<ProgressBarVariant, string> = {
  primary: "bg-navy-600",
  success: "bg-green-600",
  danger: "bg-red-600",
};

/**
 * Barra de progresso com preenchimento animado via Motion (não CSS transition
 * instantânea). Determinada: anima `scaleX` até `value`. Indeterminada: um
 * segmento desliza em loop. Sob `prefers-reduced-motion`, o loop vira uma
 * pulsação de opacidade parada no lugar.
 */
export function ProgressBar({
  value = 0,
  indeterminate = false,
  variant = "primary",
  className,
  ...aria
}: ProgressBarProps) {
  const reduzMovimento = useReducedMotion();
  const valorClamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(valorClamped)}
      {...aria}
      className={`relative h-2 w-full overflow-hidden rounded-pa-full bg-slate-200 ${className ?? ""}`}
    >
      {indeterminate ? (
        <motion.div
          className={`absolute inset-y-0 w-1/3 rounded-pa-full ${corPorVariante[variant]}`}
          animate={reduzMovimento ? { opacity: [1, 0.45, 1] } : { x: ["-100%", "220%"] }}
          transition={
            reduzMovimento
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ) : (
        <motion.div
          className={`absolute inset-y-0 left-0 h-full w-full origin-left rounded-pa-full ${corPorVariante[variant]}`}
          animate={{ scaleX: valorClamped / 100 }}
          transition={reduzMovimento ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
