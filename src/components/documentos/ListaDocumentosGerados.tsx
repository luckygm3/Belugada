import Link from "next/link";

export interface DocumentoGeradoItem {
  id: string;
  templateNome: string;
  dataGeracao: string;
  dataVencimento: string | null;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Lista simples dos documentos gerados de um funcionário (todos, não só o mais recente por template) — cada linha vai pra timeline de auditoria do documento. */
export function ListaDocumentosGerados({
  documentos,
  hrefBase,
}: {
  documentos: DocumentoGeradoItem[];
  hrefBase: string;
}) {
  if (documentos.length === 0) {
    return <p className="text-body-sm text-ink-muted">Nenhum documento gerado ainda.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {documentos.map((d) => (
        <Link
          key={d.id}
          href={`${hrefBase}/${d.id}`}
          className="flex items-center justify-between gap-4 py-3 text-body-sm transition-colors hover:bg-surface-alt"
        >
          <div className="min-w-0">
            <p className="font-medium text-ink">{d.templateNome}</p>
            <p className="text-caption text-ink-muted">
              Gerado em {formatarData(d.dataGeracao)}
              {d.dataVencimento ? ` · vence em ${formatarData(d.dataVencimento)}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-navy-600 dark:text-navy-300">Ver detalhes →</span>
        </Link>
      ))}
    </div>
  );
}
