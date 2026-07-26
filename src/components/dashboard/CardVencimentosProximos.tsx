import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { descricaoPrazo, nivelUrgencia } from "@/lib/vencimentos";

export interface VencimentoProximoItem {
  id: string;
  documentoNome: string;
  empresaNome: string;
  diasRestantes: number;
}

function IconeRelogioAlerta() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.2l3 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CLASSE_URGENCIA: Record<"urgente" | "atencao", string> = {
  urgente: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  atencao: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function CardVencimentosProximos({
  janelaDias,
  total,
  itens,
}: {
  janelaDias: number;
  total: number;
  itens: VencimentoProximoItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vencimentos próximos</CardTitle>
        <CardDescription>
          {total === 0
            ? `Nenhum documento vence nos próximos ${janelaDias} dias.`
            : `${total} documento${total === 1 ? "" : "s"} vence${total === 1 ? "" : "m"} nos próximos ${janelaDias} dias.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <EmptyState
            icone={<IconeRelogioAlerta />}
            titulo="Tudo em dia"
            descricao="Nenhum documento com vencimento próximo no momento."
          />
        ) : (
          <div className="divide-y divide-border">
            {itens.map((item) => {
              const urgencia = nivelUrgencia(item.diasRestantes);
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-ink">{item.documentoNome}</p>
                    <p className="truncate text-caption text-ink-muted">{item.empresaNome}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-pa-full px-2.5 py-0.5 text-caption font-medium ${urgencia ? CLASSE_URGENCIA[urgencia] : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
                  >
                    {descricaoPrazo(item.diasRestantes)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {total > 0 && (
        <CardFooter>
          <Link
            href="/admin/documentos?ordenar=vencimento"
            className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Ver todos →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
