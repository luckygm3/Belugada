"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  escopo: "admin" | "empresa";
  nomeUsuario: string;
}

const TRILHAS: Record<string, string[]> = {
  "/admin": ["Admin", "Dashboard"],
  "/admin/empresas": ["Admin", "Empresas"],
  "/admin/empresas/nova": ["Admin", "Empresas", "Nova empresa"],
  "/admin/templates-padrao": ["Admin", "Biblioteca de documentos"],
  "/admin/notificacoes": ["Admin", "Atividades"],
  "/empresa": ["Empresa", "Funcionários"],
  "/empresa/funcionarios/novo": ["Empresa", "Funcionários", "Novo funcionário"],
};

function trilhaPara(pathname: string, escopo: "admin" | "empresa"): string[] {
  if (TRILHAS[pathname]) return TRILHAS[pathname];
  if (pathname.startsWith("/admin/empresas/")) return ["Admin", "Empresas", "Detalhes"];
  if (pathname.match(/^\/empresa\/funcionarios\/[^/]+\/editar$/)) return ["Empresa", "Funcionários", "Editar"];
  if (pathname.match(/^\/empresa\/funcionarios\/[^/]+$/)) return ["Empresa", "Funcionários", "Detalhes"];
  return escopo === "admin" ? ["Admin"] : ["Empresa"];
}

export function Topbar({ escopo, nomeUsuario }: TopbarProps) {
  const pathname = usePathname();
  const trilha = trilhaPara(pathname, escopo);
  const inicial = (nomeUsuario || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
      <nav aria-label="Trilha de navegação" className="min-w-0 text-body-sm text-ink-muted">
        {trilha.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            {i > 0 && <span className="mx-2 text-border">/</span>}
            <span className={i === trilha.length - 1 ? "font-medium text-ink" : undefined}>{item}</span>
          </span>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <NotificationBell escopo={escopo} />
        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pa-full bg-navy-700 text-body-sm font-medium text-white">
            {inicial}
          </span>
          <span className="hidden max-w-40 truncate text-body-sm text-ink sm:block">{nomeUsuario}</span>
        </div>
      </div>
    </div>
  );
}
