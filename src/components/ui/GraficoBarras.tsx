"use client";

import { motion, useReducedMotion } from "motion/react";

export interface PontoGraficoBarras {
  rotulo: string;
  valor: number;
}

/**
 * Gráfico de barras simples (sem biblioteca — o projeto já resolve tudo em
 * SVG/CSS à mão + Motion, uma dependência nova não se justifica pra um
 * gráfico só). Altura de cada barra é % do maior valor da série; anima na
 * entrada, desativado sob `prefers-reduced-motion`.
 */
export function GraficoBarras({ dados, altura = 160, className }: { dados: PontoGraficoBarras[]; altura?: number; className?: string }) {
  const reduzMovimento = useReducedMotion();
  const maximo = Math.max(1, ...dados.map((d) => d.valor));

  return (
    <div className={`flex items-end gap-3 ${className ?? ""}`} style={{ height: altura }}>
      {dados.map((d, i) => {
        const alturaPercentual = (d.valor / maximo) * 100;
        return (
          <div key={d.rotulo} className="flex h-full flex-1 flex-col items-center gap-2">
            <span className="text-caption text-ink-muted">{d.valor}</span>
            <div className="flex w-full flex-1 items-end">
              <motion.div
                className="w-full rounded-pa-sm bg-navy-600 dark:bg-navy-400"
                style={{ minHeight: d.valor > 0 ? 2 : 0 }}
                initial={{ height: 0 }}
                animate={{ height: `${alturaPercentual}%` }}
                transition={reduzMovimento ? { duration: 0 } : { duration: 0.5, ease: "easeOut", delay: i * 0.04 }}
              />
            </div>
            <span className="text-caption text-ink-muted">{d.rotulo}</span>
          </div>
        );
      })}
    </div>
  );
}
