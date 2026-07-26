import Link from "next/link";
import type { TipoAtividade } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROTULOS_TIPO_ATIVIDADE, formatarTempoRelativo } from "@/lib/notificacoes";

export interface AtividadeRecenteItem {
  id: string;
  tipo: TipoAtividade;
  descricao: string;
  createdAt: string;
  empresaNome: string | null;
}

function IconeAtividade() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M10 5v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CardAtividadeRecente({ itens }: { itens: AtividadeRecenteItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
        <CardDescription>Os últimos eventos registrados no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <EmptyState icone={<IconeAtividade />} titulo="Nenhuma atividade ainda" />
        ) : (
          <div className="divide-y divide-border">
            {itens.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-body-sm text-ink">{a.descricao}</p>
                  <p className="mt-0.5 text-caption text-ink-muted">
                    {ROTULOS_TIPO_ATIVIDADE[a.tipo]}
                    {a.empresaNome ? ` · ${a.empresaNome}` : ""} · {formatarTempoRelativo(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/admin/notificacoes"
          className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
        >
          Ver tudo →
        </Link>
      </CardFooter>
    </Card>
  );
}
