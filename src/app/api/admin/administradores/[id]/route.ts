import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Revoga o acesso de um admin (soft — ativo:false) e encerra as sessões ativas dele. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return Response.json({ error: "Você não pode revogar o próprio acesso." }, { status: 400 });
  }

  const alvo = await prisma.usuario.findUnique({ where: { id }, select: { papel: true, ativo: true } });
  if (!alvo || alvo.papel !== "ADMIN") {
    return Response.json({ error: "Administrador não encontrado." }, { status: 404 });
  }

  if (alvo.ativo) {
    const adminsAtivos = await prisma.usuario.count({ where: { papel: "ADMIN", ativo: true } });
    if (adminsAtivos <= 1) {
      return Response.json({ error: "Não é possível revogar o último administrador ativo." }, { status: 400 });
    }
  }

  await prisma.usuario.update({ where: { id }, data: { ativo: false } });
  await prisma.sessaoAtiva.updateMany({
    where: { usuarioId: id, revogadaEm: null },
    data: { revogadaEm: new Date() },
  });

  return Response.json({ ok: true });
}
