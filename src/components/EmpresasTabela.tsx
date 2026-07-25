"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";

export interface EmpresaLinha {
  id: string;
  razaoSocial: string;
  cnpj: string;
  planoContratado: string | null;
  statusPagamento: string;
  funcionariosCount: number;
}

function IniciaisEmpresa({ nome }: { nome: string }) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pa-full bg-navy-50 text-body-sm font-medium text-navy-700 dark:bg-navy-900 dark:text-navy-200">
      {inicial}
    </span>
  );
}

export function EmpresasTabela({ empresas }: { empresas: EmpresaLinha[] }) {
  const router = useRouter();

  return (
    <table className="w-full text-body-sm">
      <thead className="bg-surface-alt text-left">
        <tr>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Razão social</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">CNPJ</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Plano</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Status</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Funcionários</th>
        </tr>
      </thead>
      <tbody>
        {empresas.map((empresa) => {
          const irParaDetalhes = () => router.push(`/admin/empresas/${empresa.id}`);
          const aoPressionarTecla = (e: KeyboardEvent<HTMLTableRowElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              irParaDetalhes();
            }
          };

          return (
            <tr
              key={empresa.id}
              onClick={irParaDetalhes}
              onKeyDown={aoPressionarTecla}
              tabIndex={0}
              role="link"
              aria-label={`Ver detalhes de ${empresa.razaoSocial}`}
              // bg-surface-alt (não uma cor crua) — herda o tom certo do tema
              // ativo automaticamente via variável CSS, sem precisar saber
              // se está em dark mode.
              className="cursor-pointer border-t border-border transition-colors duration-150 hover:bg-surface-alt focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-inset"
            >
              <td className="p-4 text-ink">
                <div className="flex items-center gap-3">
                  <IniciaisEmpresa nome={empresa.razaoSocial} />
                  <span>{empresa.razaoSocial}</span>
                </div>
              </td>
              <td className="p-4 text-ink">{empresa.cnpj}</td>
              <td className="p-4 text-ink">{empresa.planoContratado || "-"}</td>
              <td className="p-4">
                <BadgeStatus status={empresa.statusPagamento} />
              </td>
              <td className="p-4 text-ink">{empresa.funcionariosCount}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
