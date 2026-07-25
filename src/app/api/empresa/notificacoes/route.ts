import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Escopo fixo: só alertas de vencimento da própria empresa. Atividade genérica
// (funcionário criado/editado/excluído) é assunto do admin, não da empresa.
export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA" || !session.user.empresaId) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);

  const [notificacoes, naoLidas] = await Promise.all([
    prisma.notificacao.findMany({
      where: { empresaId: session.user.empresaId, tipo: "VENCIMENTO_PROXIMO" },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notificacao.count({
      where: { empresaId: session.user.empresaId, tipo: "VENCIMENTO_PROXIMO", lida: false },
    }),
  ]);

  return Response.json({ notificacoes, naoLidas });
}
