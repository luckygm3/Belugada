import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { BadgeStatus } from "@/components/ui/BadgeStatus";

const ROTULO_PLANO: Record<string, string> = {
  MENSAL: "Mensal",
  ANUAL: "Anual",
};

export interface EmpresaResumoItem {
  id: string;
  razaoSocial: string;
  planoContratado: string | null;
  statusPagamento: string;
  funcionariosCount: number;
  pendentesCount: number;
}

function IniciaisEmpresa({ nome }: { nome: string }) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pa-full bg-navy-50 text-body-sm font-medium text-navy-700 dark:bg-navy-900 dark:text-navy-200">
      {inicial}
    </span>
  );
}

export function CardEmpresasResumo({ itens, destacaPendencias }: { itens: EmpresaResumoItem[]; destacaPendencias: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas</CardTitle>
        <CardDescription>
          {destacaPendencias ? "Empresas com funcionários pendentes de documentação." : "Cadastradas mais recentemente."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {itens.map((empresa) => (
            <Link
              key={empresa.id}
              href={`/admin/empresas/${empresa.id}`}
              className="flex items-center gap-3 px-6 py-3 text-body-sm transition-colors hover:bg-surface-alt"
            >
              <IniciaisEmpresa nome={empresa.razaoSocial} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{empresa.razaoSocial}</p>
                <p className="truncate text-caption text-ink-muted">
                  {ROTULO_PLANO[empresa.planoContratado ?? ""] ?? "—"} · {empresa.funcionariosCount} funcionário
                  {empresa.funcionariosCount === 1 ? "" : "s"}
                </p>
              </div>
              {empresa.pendentesCount > 0 && (
                <span className="shrink-0 rounded-pa-full bg-amber-50 px-2 py-0.5 text-caption font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {empresa.pendentesCount} pendente{empresa.pendentesCount === 1 ? "" : "s"}
                </span>
              )}
              <BadgeStatus status={empresa.statusPagamento} />
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href="/admin/empresas"
          className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
        >
          Ver todas →
        </Link>
      </CardFooter>
    </Card>
  );
}
