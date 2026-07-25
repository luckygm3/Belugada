"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import ExcluirFuncionarioButton from "@/components/ExcluirFuncionarioButton";

export interface FuncionarioLinha {
  id: string;
  nomeCompleto: string;
  cargo: string | null;
  statusDocumentacao: string;
}

function IniciaisFuncionario({ nome }: { nome: string }) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pa-full bg-teal-50 text-body-sm font-medium text-teal-700 dark:bg-teal-900 dark:text-teal-200">
      {inicial}
    </span>
  );
}

export function FuncionariosTabela({ funcionarios }: { funcionarios: FuncionarioLinha[] }) {
  const router = useRouter();

  function pararPropagacao(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <table className="w-full text-body-sm">
      <thead className="bg-surface-alt text-left">
        <tr>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Nome</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Cargo</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Status documentação</th>
          <th className="p-4"></th>
        </tr>
      </thead>
      <tbody>
        {funcionarios.map((f) => {
          const irParaDetalhes = () => router.push(`/empresa/funcionarios/${f.id}`);
          const aoPressionarTecla = (e: KeyboardEvent<HTMLTableRowElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              irParaDetalhes();
            }
          };

          return (
            <tr
              key={f.id}
              onClick={irParaDetalhes}
              onKeyDown={aoPressionarTecla}
              tabIndex={0}
              role="link"
              aria-label={`Ver detalhes de ${f.nomeCompleto}`}
              className="cursor-pointer border-t border-border transition-colors duration-150 hover:bg-surface-alt focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-inset"
            >
              <td className="p-4 text-ink">
                <div className="flex items-center gap-3">
                  <IniciaisFuncionario nome={f.nomeCompleto} />
                  <span>{f.nomeCompleto}</span>
                </div>
              </td>
              <td className="p-4 text-ink">{f.cargo || "-"}</td>
              <td className="p-4">
                <BadgeStatus status={f.statusDocumentacao} />
              </td>
              <td className="p-4 text-right" onClick={pararPropagacao}>
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/empresa/funcionarios/${f.id}/editar`}
                    className="text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
                  >
                    Editar
                  </Link>
                  <ExcluirFuncionarioButton funcionarioId={f.id} nomeFuncionario={f.nomeCompleto} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
