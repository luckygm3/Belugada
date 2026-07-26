import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Revoga (soft delete) uma sessão do usuário logado — não permite revogar a sessão atual. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.sessionId) {
    return Response.json({ error: "Use o botão Sair para encerrar a sessão atual." }, { status: 400 });
  }

  const sessao = await prisma.sessaoAtiva.findUnique({ where: { id }, select: { usuarioId: true } });
  if (!sessao || sessao.usuarioId !== session.user.id) {
    return Response.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  await prisma.sessaoAtiva.update({ where: { id }, data: { revogadaEm: new Date() } });

  return Response.json({ ok: true });
}
