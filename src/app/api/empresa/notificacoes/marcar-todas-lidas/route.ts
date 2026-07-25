import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA" || !session.user.empresaId) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  await prisma.notificacao.updateMany({
    where: { empresaId: session.user.empresaId, tipo: "VENCIMENTO_PROXIMO", lida: false },
    data: { lida: true },
  });

  return Response.json({ ok: true });
}
