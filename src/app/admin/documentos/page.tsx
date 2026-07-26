import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentosGeradosTabelaAdmin } from "@/components/DocumentosGeradosTabelaAdmin";

const LIMITE = 20;

function IconeDocumentoGrande() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M8 4h11l5 5v18a1 1 0 01-1 1H8a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M19 4v4a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function calcularDiasRestantes(dataVencimento: Date | null): number | null {
  if (!dataVencimento) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  return Math.round((vencimento.getTime() - hoje.getTime()) / 86_400_000);
}

interface PageProps {
  searchParams: Promise<{ ordenar?: string; page?: string }>;
}

export default async function AdminDocumentosPage({ searchParams }: PageProps) {
  const { ordenar, page: pageParam } = await searchParams;
  const porVencimento = ordenar === "vencimento";
  const page = Math.max(Number(pageParam) || 1, 1);

  const [documentos, total] = await Promise.all([
    prisma.documentoGerado.findMany({
      // Postgres: ASC manda NULL pro fim por padrão — documentos sem vencimento
      // ficam depois dos que têm data, exatamente o que faz sentido aqui.
      orderBy: porVencimento ? [{ dataVencimento: "asc" }] : [{ dataGeracao: "desc" }],
      skip: (page - 1) * LIMITE,
      take: LIMITE,
      include: {
        template: { select: { nome: true } },
        funcionario: { select: { nomeCompleto: true, empresa: { select: { razaoSocial: true } } } },
      },
    }),
    prisma.documentoGerado.count(),
  ]);

  const totalPaginas = Math.max(Math.ceil(total / LIMITE), 1);

  function linkComPagina(novaPagina: number) {
    const params = new URLSearchParams();
    if (ordenar) params.set("ordenar", ordenar);
    params.set("page", String(novaPagina));
    return `/admin/documentos?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Documentos gerados</h1>
          <p className="mt-1 text-body-sm text-ink-muted">Todos os documentos, de todas as empresas.</p>
        </div>
        <div className="flex gap-3 text-body-sm">
          <Link
            href="/admin/documentos"
            className={!porVencimento ? "font-medium text-ink" : "text-navy-600 hover:underline dark:text-navy-300"}
          >
            Mais recentes
          </Link>
          <Link
            href="/admin/documentos?ordenar=vencimento"
            className={porVencimento ? "font-medium text-ink" : "text-navy-600 hover:underline dark:text-navy-300"}
          >
            Por vencimento
          </Link>
        </div>
      </div>

      {documentos.length === 0 ? (
        <EmptyState icone={<IconeDocumentoGrande />} titulo="Nenhum documento gerado ainda" />
      ) : (
        <Card className="overflow-hidden p-0">
          <DocumentosGeradosTabelaAdmin
            documentos={documentos.map((d) => ({
              id: d.id,
              templateNome: d.template.nome,
              funcionarioNome: d.funcionario.nomeCompleto,
              empresaNome: d.funcionario.empresa.razaoSocial,
              dataGeracao: d.dataGeracao.toISOString(),
              dataVencimento: d.dataVencimento ? d.dataVencimento.toISOString() : null,
              diasRestantes: calcularDiasRestantes(d.dataVencimento),
            }))}
          />
        </Card>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-body-sm text-ink-muted">
          <span>
            Página {page} de {totalPaginas} · {total} documento{total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-3">
            {page > 1 && (
              <Link href={linkComPagina(page - 1)} className="text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline">
                Anterior
              </Link>
            )}
            {page < totalPaginas && (
              <Link href={linkComPagina(page + 1)} className="text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
