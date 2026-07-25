"use client";

import { useState } from "react";
import type { TipoAtividade } from "@prisma/client";
import { ROTULOS_TIPO_ATIVIDADE } from "@/lib/notificacoes";

export interface NotificacaoLinha {
  id: string;
  tipo: TipoAtividade;
  descricao: string;
  lida: boolean;
  createdAt: string;
  empresa: { id: string; razaoSocial: string } | null;
  usuario: { id: string; emailOuLogin: string } | null;
}

export function NotificacoesTabela({ notificacoes }: { notificacoes: NotificacaoLinha[] }) {
  const [linhas, setLinhas] = useState(notificacoes);

  async function marcarComoLida(id: string) {
    setLinhas((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    try {
      await fetch(`/api/admin/notificacoes/${id}`, { method: "PATCH" });
    } catch {
      // otimista: recarregar a página reflete o estado real do banco
    }
  }

  return (
    <table className="w-full text-body-sm">
      <thead className="bg-surface-alt text-left">
        <tr>
          <th className="p-3 font-medium text-ink-muted">Data</th>
          <th className="p-3 font-medium text-ink-muted">Empresa</th>
          <th className="p-3 font-medium text-ink-muted">Tipo</th>
          <th className="p-3 font-medium text-ink-muted">Descrição</th>
          <th className="p-3 font-medium text-ink-muted">Usuário</th>
          <th className="p-3 font-medium text-ink-muted">Status</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((n) => (
          <tr key={n.id} className="border-t border-border">
            <td className="whitespace-nowrap p-3 text-ink-muted">
              {new Date(n.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </td>
            <td className="p-3 text-ink">{n.empresa?.razaoSocial ?? "—"}</td>
            <td className="p-3 text-ink">{ROTULOS_TIPO_ATIVIDADE[n.tipo]}</td>
            <td className="p-3 text-ink">{n.descricao}</td>
            <td className="p-3 text-ink-muted">{n.usuario?.emailOuLogin ?? "—"}</td>
            <td className="p-3">
              {n.lida ? (
                <span className="text-caption text-ink-muted">Lida</span>
              ) : (
                <button
                  type="button"
                  onClick={() => marcarComoLida(n.id)}
                  className="text-caption font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
                >
                  Marcar como lida
                </button>
              )}
            </td>
          </tr>
        ))}
        {linhas.length === 0 && (
          <tr>
            <td colSpan={6} className="p-6 text-center text-ink-muted">
              Nenhuma atividade encontrada para esses filtros.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
