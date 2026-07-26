"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { BuscaInput } from "@/components/ui/BuscaInput";
import { contemBusca } from "@/lib/normalizarTexto";

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

function corresponde(empresa: EmpresaLinha, busca: string): boolean {
  if (!busca.trim()) return true;
  const cnpjDigitos = empresa.cnpj.replace(/\D/g, "");
  const buscaDigitos = busca.replace(/\D/g, "");
  return contemBusca(empresa.razaoSocial, busca) || (buscaDigitos !== "" && cnpjDigitos.includes(buscaDigitos));
}

export function EmpresasTabela({ empresas }: { empresas: EmpresaLinha[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const empresasFiltradas = useMemo(
    () => empresas.filter((empresa) => corresponde(empresa, busca)),
    [empresas, busca]
  );

  return (
    <div>
      <div className="border-b border-border p-4">
        <BuscaInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por razão social ou CNPJ..."
          aria-label="Buscar empresa"
          className="max-w-sm"
        />
      </div>

      {empresasFiltradas.length === 0 ? (
        <p className="p-6 text-center text-body-sm text-ink-muted">Nenhuma empresa encontrada para &quot;{busca}&quot;.</p>
      ) : (
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
            {empresasFiltradas.map((empresa) => {
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
      )}
    </div>
  );
}
