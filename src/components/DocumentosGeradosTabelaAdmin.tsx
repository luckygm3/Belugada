"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { nivelUrgencia, descricaoPrazo } from "@/lib/vencimentos";

export interface DocumentoGeradoLinhaAdmin {
  id: string;
  templateNome: string;
  funcionarioNome: string;
  empresaNome: string;
  dataGeracao: string;
  dataVencimento: string | null;
  diasRestantes: number | null;
}

function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(iso));
}

const CLASSE_URGENCIA: Record<"urgente" | "atencao", string> = {
  urgente: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  atencao: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

function VencimentoCelula({ dataVencimento, diasRestantes }: { dataVencimento: string | null; diasRestantes: number | null }) {
  if (!dataVencimento || diasRestantes === null) return <span className="text-ink-muted">—</span>;

  const urgencia = nivelUrgencia(diasRestantes);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-ink">{formatarData(dataVencimento)}</span>
      {urgencia && (
        <span className={`inline-flex w-fit rounded-pa-full px-2 py-0.5 text-caption font-medium ${CLASSE_URGENCIA[urgencia]}`}>
          {descricaoPrazo(diasRestantes)}
        </span>
      )}
    </div>
  );
}

export function DocumentosGeradosTabelaAdmin({ documentos }: { documentos: DocumentoGeradoLinhaAdmin[] }) {
  const router = useRouter();

  return (
    <table className="w-full text-body-sm">
      <thead className="bg-surface-alt text-left">
        <tr>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Documento</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Funcionário</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Empresa</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Gerado em</th>
          <th className="p-4 text-caption font-medium uppercase tracking-wide text-ink-muted">Vencimento</th>
        </tr>
      </thead>
      <tbody>
        {documentos.map((d) => {
          const irParaDetalhes = () => router.push(`/admin/documentos/${d.id}`);
          const aoPressionarTecla = (e: KeyboardEvent<HTMLTableRowElement>) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              irParaDetalhes();
            }
          };

          return (
            <tr
              key={d.id}
              onClick={irParaDetalhes}
              onKeyDown={aoPressionarTecla}
              tabIndex={0}
              role="link"
              aria-label={`Ver detalhes de ${d.templateNome}`}
              className="cursor-pointer border-t border-border transition-colors duration-150 hover:bg-surface-alt focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-inset"
            >
              <td className="p-4 text-ink">{d.templateNome}</td>
              <td className="p-4 text-ink">{d.funcionarioNome}</td>
              <td className="p-4 text-ink">{d.empresaNome}</td>
              <td className="p-4 text-ink-muted">{formatarData(d.dataGeracao)}</td>
              <td className="p-4">
                <VencimentoCelula dataVencimento={d.dataVencimento} diasRestantes={d.diasRestantes} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
