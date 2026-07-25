import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const notificacao = await prisma.notificacao.findUnique({ where: { id } });
  if (!notificacao) {
    return Response.json({ error: "Notificação não encontrada." }, { status: 404 });
  }

  await prisma.notificacao.update({ where: { id }, data: { lida: true } });

  return Response.json({ ok: true });
}
