"use client";

import { motion, useReducedMotion } from "motion/react";

interface SpinnerProps {
  className?: string;
  /** Tamanho em px do quadrado que contém o spinner. */
  size?: number;
}

/**
 * Spinner circular inline (usado pelo Button em `loading`, mas reutilizável
 * em qualquer lugar que precise indicar carregamento em andamento).
 * Sob `prefers-reduced-motion`, troca a rotação contínua por uma pulsação
 * discreta de opacidade.
 */
export function Spinner({ className, size = 16 }: SpinnerProps) {
  const reduzMovimento = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role="status"
      aria-label="Carregando"
      animate={reduzMovimento ? { opacity: [1, 0.4, 1] } : { rotate: 360 }}
      transition={
        reduzMovimento
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.7, repeat: Infinity, ease: "linear" }
      }
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42 60"
        opacity="0.9"
      />
    </motion.svg>
  );
}
