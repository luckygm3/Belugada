import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { BotaoBaixarDocumento } from "./BotaoBaixarDocumento";
import { formatarDataHora } from "@/lib/dispositivo";

export interface EventoAuditoriaItem {
  id: string;
  tipo: "GERACAO" | "DOWNLOAD" | "SUBSTITUIDO";
  usuarioNome: string | null;
  criadoEm: string;
  templateNome: string | null;
  templateHash: string | null;
  variaveisUsadas: Record<string, string> | null;
  documentoSubstitutoId: string | null;
}

interface DocumentoAuditoriaViewProps {
  documentoId: string;
  templateNome: string;
  funcionarioNome: string;
  empresaNome?: string;
  dataGeracao: string;
  dataVencimento: string | null;
  eventos: EventoAuditoriaItem[];
  hrefBaseDocumento: string;
}

const ROTULO_TIPO: Record<EventoAuditoriaItem["tipo"], string> = {
  GERACAO: "Documento gerado",
  DOWNLOAD: "Baixado",
  SUBSTITUIDO: "Substituído por um novo documento",
};

const COR_TIPO: Record<EventoAuditoriaItem["tipo"], string> = {
  GERACAO: "bg-navy-600",
  DOWNLOAD: "bg-slate-400",
  SUBSTITUIDO: "bg-amber-500",
};

function EventoTimeline({ evento, hrefBaseDocumento }: { evento: EventoAuditoriaItem; hrefBaseDocumento: string }) {
  return (
    <div className="flex gap-3 py-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-pa-full ${COR_TIPO[evento.tipo]}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-ink">{ROTULO_TIPO[evento.tipo]}</p>
        <p className="text-caption text-ink-muted">
          {evento.usuarioNome ? `${evento.usuarioNome} · ` : ""}
          {formatarDataHora(evento.criadoEm)}
        </p>

        {evento.tipo === "GERACAO" && (
          <details className="mt-2">
            <summary className="cursor-pointer text-caption text-navy-600 dark:text-navy-300">
              Ver dados usados na geração
            </summary>
            <div className="mt-2 space-y-1 rounded-pa-md border border-border bg-surface-alt p-3">
              {evento.templateHash && (
                <p className="text-caption text-ink-muted" title={evento.templateHash}>
                  Hash do template: <span className="font-mono">{evento.templateHash.slice(0, 16)}…</span>
                </p>
              )}
              {evento.variaveisUsadas && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-caption">
                  {Object.entries(evento.variaveisUsadas).map(([chave, valor]) => (
                    <div key={chave} className="contents">
                      <dt className="text-ink-muted">{chave}</dt>
                      <dd className="text-ink">{String(valor) || "-"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </details>
        )}

        {evento.tipo === "SUBSTITUIDO" && evento.documentoSubstitutoId && (
          <Link
            href={`${hrefBaseDocumento}/${evento.documentoSubstitutoId}`}
            className="mt-1 inline-block text-caption font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Ver documento novo →
          </Link>
        )}
      </div>
    </div>
  );
}

/** Cabeçalho + timeline cronológica de eventos de um documento gerado — imutável, só leitura. */
export function DocumentoAuditoriaView({
  documentoId,
  templateNome,
  funcionarioNome,
  empresaNome,
  dataGeracao,
  dataVencimento,
  eventos,
  hrefBaseDocumento,
}: DocumentoAuditoriaViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{templateNome}</CardTitle>
          <CardDescription>
            {funcionarioNome}
            {empresaNome ? ` · ${empresaNome}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-body-sm">
            <span className="text-ink-muted">Gerado em: </span>
            <span className="text-ink">{formatarDataHora(dataGeracao)}</span>
          </p>
          {dataVencimento && (
            <p className="text-body-sm">
              <span className="text-ink-muted">Vence em: </span>
              <span className="text-ink">{formatarDataHora(dataVencimento)}</span>
            </p>
          )}
        </CardContent>
        <CardFooter>
          <BotaoBaixarDocumento documentoId={documentoId} />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trilha de auditoria</CardTitle>
          <CardDescription>Histórico completo deste documento — geração, downloads e substituições, em ordem cronológica.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {eventos.map((evento) => (
            <EventoTimeline key={evento.id} evento={evento} hrefBaseDocumento={hrefBaseDocumento} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
