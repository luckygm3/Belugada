"use client";

import { useState } from "react";

export interface NotaFeedbackItem {
  id: string;
  texto: string;
  paginaOrigem: string;
  visto: boolean;
  createdAt: string;
  autorNome: string;
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function FeedbackTabela({ notas: notasIniciais }: { notas: NotaFeedbackItem[] }) {
  const [notas, setNotas] = useState(notasIniciais);

  async function alternarVisto(id: string, vistoAtual: boolean) {
    setNotas((atual) => atual.map((n) => (n.id === id ? { ...n, visto: !vistoAtual } : n)));
    try {
      await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visto: !vistoAtual }),
      });
    } catch {
      // otimista: se falhar, só reaparece assim na próxima visita
    }
  }

  return (
    <div className="space-y-3">
      {notas.map((n) => (
        <div
          key={n.id}
          className={`rounded-pa-lg border border-border bg-surface p-4 shadow-pa-sm ${n.visto ? "opacity-60" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="whitespace-pre-wrap text-body-sm text-ink">{n.texto}</p>
              <p className="mt-2 text-caption text-ink-muted">
                {n.autorNome} · {n.paginaOrigem} · {formatarDataHora(n.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => alternarVisto(n.id, n.visto)}
              className="shrink-0 text-caption font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
            >
              {n.visto ? "Marcar como não visto" : "Marcar como visto"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
