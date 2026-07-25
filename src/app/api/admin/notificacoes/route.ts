import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoAtividade, type Prisma } from "@prisma/client";

const TIPOS_VALIDOS = Object.values(TipoAtividade);

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const url = new URL(req.url);
  const empresaId = url.searchParams.get("empresaId");
  const tipoParam = url.searchParams.get("tipo");
  const tipoExcluidoParam = url.searchParams.get("tipoExcluido");
  const de = url.searchParams.get("de");
  const ate = url.searchParams.get("ate");
  const apenasNaoLidas = url.searchParams.get("naoLidas") === "true";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);

  const where: Prisma.NotificacaoWhereInput = {};

  if (empresaId) where.empresaId = empresaId;
  if (tipoParam && TIPOS_VALIDOS.includes(tipoParam as TipoAtividade)) {
    where.tipo = tipoParam as TipoAtividade;
  }
  if (tipoExcluidoParam && TIPOS_VALIDOS.includes(tipoExcluidoParam as TipoAtividade)) {
    where.tipo = { not: tipoExcluidoParam as TipoAtividade };
  }
  if (apenasNaoLidas) where.lida = false;
  if (de || ate) {
    where.createdAt = {
      ...(de ? { gte: new Date(de) } : {}),
      ...(ate ? { lte: new Date(`${ate}T23:59:59.999`) } : {}),
    };
  }

  const [notificacoes, total, naoLidas] = await Promise.all([
    prisma.notificacao.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        empresa: { select: { id: true, razaoSocial: true } },
        usuario: { select: { id: true, emailOuLogin: true } },
      },
    }),
    prisma.notificacao.count({ where }),
    prisma.notificacao.count({ where: { lida: false } }),
  ]);

  return Response.json({ notificacoes, total, naoLidas, page, limit });
}
