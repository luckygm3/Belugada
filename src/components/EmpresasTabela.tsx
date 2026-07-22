"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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

export function EmpresasTabela({ empresas }: { empresas: EmpresaLinha[] }) {
  const router = useRouter();

  return (
    <table className="w-full text-body-sm">
      <thead className="bg-surface-alt text-left">
        <tr>
          <th className="p-3 font-medium text-ink-muted">Razão social</th>
          <th className="p-3 font-medium text-ink-muted">CNPJ</th>
          <th className="p-3 font-medium text-ink-muted">Plano</th>
          <th className="p-3 font-medium text-ink-muted">Status</th>
          <th className="p-3 font-medium text-ink-muted">Funcionários</th>
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
            <motion.tr
              key={empresa.id}
              onClick={irParaDetalhes}
              onKeyDown={aoPressionarTecla}
              tabIndex={0}
              role="link"
              aria-label={`Ver detalhes de ${empresa.razaoSocial}`}
              initial={false}
              whileHover={{ backgroundColor: "#f7f9fb" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="cursor-pointer border-t border-border focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-inset"
            >
              <td className="p-3 text-ink">{empresa.razaoSocial}</td>
              <td className="p-3 text-ink">{empresa.cnpj}</td>
              <td className="p-3 text-ink">{empresa.planoContratado || "-"}</td>
              <td className="p-3">
                <BadgeStatus status={empresa.statusPagamento} />
              </td>
              <td className="p-3 text-ink">{empresa.funcionariosCount}</td>
            </motion.tr>
          );
        })}
        {empresas.length === 0 && (
          <tr>
            <td colSpan={5} className="p-6 text-center text-ink-muted">
              Nenhuma empresa cadastrada ainda.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
