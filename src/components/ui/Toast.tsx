"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type ToastVariant = "success" | "error";

export interface ToastProps {
  aberto: boolean;
  variant?: ToastVariant;
  titulo: string;
  descricao?: string;
  acao?: { rotulo: string; onClick: () => void };
  onFechar: () => void;
}

function IconeSucesso() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeErro() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
      <path d="M10 6.5v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Toast (snackbar) fixo no canto inferior direito. Sem faixa colorida na
 * lateral — a variante é comunicada pelo ícone, não por um `border-left`.
 */
export function Toast({ aberto, variant = "success", titulo, descricao, acao, onFechar }: ToastProps) {
  const reduzMovimento = useReducedMotion();

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
          animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm items-start gap-3 rounded-pa-lg border border-border bg-surface p-4 shadow-pa-lg"
        >
          <span className={`shrink-0 ${variant === "success" ? "text-green-600" : "text-red-600"}`}>
            {variant === "success" ? <IconeSucesso /> : <IconeErro />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-ink">{titulo}</p>
            {descricao && <p className="mt-0.5 text-body-sm text-ink-muted">{descricao}</p>}
            {acao && (
              <button
                onClick={acao.onClick}
                className="mt-2 text-body-sm font-medium text-navy-600 hover:text-navy-700 hover:underline"
              >
                {acao.rotulo}
              </button>
            )}
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar notificação"
            className="shrink-0 text-ink-muted hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
