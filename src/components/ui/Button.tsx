"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { Spinner } from "./Spinner";

type Variante = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variante;
  /** Mostra um spinner inline antes do conteúdo e desabilita o botão. */
  loading?: boolean;
  children: React.ReactNode;
}

const classesPorVariante: Record<Variante, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-border hover:bg-slate-50 hover:border-slate-300",
  ghost: "bg-transparent text-ink hover:bg-slate-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

/**
 * Botão base do painel admin (navy/teal/slate). Escala sutil no hover/click
 * via Motion; cor por transição CSS. Sob `prefers-reduced-motion`, a escala
 * é desativada e só a cor muda.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, disabled, className, children, ...props },
  ref
) {
  const reduzMovimento = useReducedMotion();
  const desabilitado = disabled || loading;

  return (
    <motion.button
      ref={ref}
      disabled={desabilitado}
      aria-busy={loading}
      whileHover={!desabilitado && !reduzMovimento ? { scale: 1.02 } : undefined}
      whileTap={!desabilitado && !reduzMovimento ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-pa-md px-4 py-2",
        "text-body font-medium transition-colors duration-150",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2",
        classesPorVariante[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {loading && <Spinner size={15} />}
      {children}
    </motion.button>
  );
});
