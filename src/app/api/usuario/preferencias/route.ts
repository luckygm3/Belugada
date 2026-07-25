import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { preferenciasSchema, lerPreferencias } from "@/lib/preferencias";
import { Prisma } from "@prisma/client";

/** Atualiza (merge, não substitui) as preferências salvas na conta do usuário logado. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validado = preferenciasSchema.safeParse(body);
  if (!validado.success) {
    return Response.json({ error: "Preferências inválidas." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { preferencias: true },
  });

  // Sessão JWT pode sobreviver à exclusão do usuário (Auth.js com estratégia
  // JWT não revalida contra o banco a cada request) — nesse caso não há como
  // salvar a preferência; a mudança já vale localmente (cookie), então não é
  // um erro grave, só não persiste na conta.
  if (!usuario) {
    return Response.json({ error: "Sessão inválida — faça login novamente." }, { status: 401 });
  }

  const atuais = lerPreferencias(usuario.preferencias);
  const atualizadas = { ...atuais, ...validado.data };

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { preferencias: atualizadas as Prisma.InputJsonValue },
  });

  return Response.json({ preferencias: atualizadas });
}
