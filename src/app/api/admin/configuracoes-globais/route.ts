import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { configuracaoGlobalSchema } from "@/lib/configuracaoGlobal";
import { primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import type { Prisma } from "@prisma/client";

/** Salva ajustes globais do sistema (hoje só os prazos de alerta de vencimento). */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const validado = configuracaoGlobalSchema.safeParse(body);
  if (!validado.success) {
    return Response.json({ error: primeiraMensagemDeErro(validado.error) }, { status: 400 });
  }

  const valores = validado.data as Prisma.InputJsonValue;

  await prisma.configuracaoGlobal.upsert({
    where: { id: "global" },
    create: { id: "global", valores },
    update: { valores },
  });

  return Response.json({ ok: true });
}
