import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Lista as sessões ativas (não revogadas) do usuário logado. */
export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const sessoes = await prisma.sessaoAtiva.findMany({
    where: { usuarioId: session.user.id, revogadaEm: null },
    orderBy: { criadoEm: "desc" },
    select: { id: true, userAgent: true, ip: true, criadoEm: true, ultimoUso: true },
  });

  return Response.json({
    sessoes: sessoes.map((s) => ({ ...s, atual: s.id === session.sessionId })),
  });
}
