import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Prisma, TipoAtividade } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { NotificacoesTabela } from "@/components/NotificacoesTabela";
import { ROTULOS_TIPO_ATIVIDADE } from "@/lib/notificacoes";

const LIMITE = 20;
const TIPOS_VALIDOS = Object.keys(ROTULOS_TIPO_ATIVIDADE) as TipoAtividade[];

interface PageProps {
  searchParams: Promise<{
    empresaId?: string;
    tipo?: string;
    de?: string;
    ate?: string;
    naoLidas?: string;
    page?: string;
  }>;
}

export default async function NotificacoesPage({ searchParams }: PageProps) {
  const filtros = await searchParams;
  const page = Math.max(Number(filtros.page) || 1, 1);

  const where: Prisma.NotificacaoWhereInput = {};
  if (filtros.empresaId) where.empresaId = filtros.empresaId;
  if (filtros.tipo && TIPOS_VALIDOS.includes(filtros.tipo as TipoAtividade)) {
    where.tipo = filtros.tipo as TipoAtividade;
  }
  if (filtros.naoLidas === "true") where.lida = false;
  if (filtros.de || filtros.ate) {
    where.createdAt = {
      ...(filtros.de ? { gte: new Date(filtros.de) } : {}),
      ...(filtros.ate ? { lte: new Date(`${filtros.ate}T23:59:59.999`) } : {}),
    };
  }

  const [notificacoes, total, empresas] = await Promise.all([
    prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMITE,
      take: LIMITE,
      include: {
        empresa: { select: { id: true, razaoSocial: true } },
        usuario: { select: { id: true, emailOuLogin: true } },
      },
    }),
    prisma.notificacao.count({ where }),
    prisma.empresa.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: "asc" } }),
  ]);

  const totalPaginas = Math.max(Math.ceil(total / LIMITE), 1);

  function linkComPagina(novaPagina: number) {
    const params = new URLSearchParams();
    if (filtros.empresaId) params.set("empresaId", filtros.empresaId);
    if (filtros.tipo) params.set("tipo", filtros.tipo);
    if (filtros.de) params.set("de", filtros.de);
    if (filtros.ate) params.set("ate", filtros.ate);
    if (filtros.naoLidas) params.set("naoLidas", filtros.naoLidas);
    params.set("page", String(novaPagina));
    return `/admin/notificacoes?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Atividades</h1>

      <Card className="p-4">
        <form method="get" className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="empresaId" className="text-label text-ink-muted">
              Empresa
            </label>
            <select
              id="empresaId"
              name="empresaId"
              defaultValue={filtros.empresaId ?? ""}
              className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="tipo" className="text-label text-ink-muted">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={filtros.tipo ?? ""}
              className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
            >
              <option value="">Todos</option>
              {TIPOS_VALIDOS.map((t) => (
                <option key={t} value={t}>
                  {ROTULOS_TIPO_ATIVIDADE[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="de" className="text-label text-ink-muted">
              De
            </label>
            <input
              id="de"
              type="date"
              name="de"
              defaultValue={filtros.de ?? ""}
              className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ate" className="text-label text-ink-muted">
              Até
            </label>
            <input
              id="ate"
              type="date"
              name="ate"
              defaultValue={filtros.ate ?? ""}
              className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
            />
          </div>

          <label className="flex items-center gap-2 pb-2 text-body-sm text-ink">
            <input type="checkbox" name="naoLidas" value="true" defaultChecked={filtros.naoLidas === "true"} />
            Somente não lidas
          </label>

          <button
            type="submit"
            className="rounded-pa-md bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-primary-hover"
          >
            Filtrar
          </button>
          {(filtros.empresaId || filtros.tipo || filtros.de || filtros.ate || filtros.naoLidas) && (
            <Link href="/admin/notificacoes" className="pb-2 text-body-sm text-ink-muted hover:text-ink hover:underline">
              Limpar filtros
            </Link>
          )}
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <NotificacoesTabela
          notificacoes={notificacoes.map((n) => ({
            id: n.id,
            tipo: n.tipo,
            descricao: n.descricao,
            lida: n.lida,
            createdAt: n.createdAt.toISOString(),
            empresa: n.empresa,
            usuario: n.usuario,
          }))}
        />
      </Card>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-body-sm text-ink-muted">
          <span>
            Página {page} de {totalPaginas} · {total} atividade{total === 1 ? "" : "s"}
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
