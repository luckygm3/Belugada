import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { escolhasConsentimentoSchema } from "@/lib/consentimento";
import { Prisma } from "@prisma/client";

/**
 * Grava um registro de auditoria por escolha de consentimento (não
 * sobrescreve o anterior — histórico completo pra comprovar conformidade
 * mesmo que o visitante limpe os cookies depois). `usuarioId` só é
 * preenchido no raro caso de alguém já logado estar navegando pela landing.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const validado = escolhasConsentimentoSchema.safeParse(body);
  if (!validado.success) {
    return Response.json({ error: "Escolha de cookies inválida." }, { status: 400 });
  }

  const session = await auth().catch(() => null);

  const dados = {
    preferencias: validado.data.preferencias,
    analytics: validado.data.analytics,
  };

  try {
    await prisma.consentimentoCookies.create({
      data: { ...dados, usuarioId: session?.user?.id },
    });
  } catch (err) {
    // Sessão JWT pode apontar pra um usuário já excluído (a estratégia JWT do
    // Auth.js não revalida contra o banco a cada request) — nesse caso a FK
    // falha; grava o consentimento mesmo assim, só sem o vínculo de usuário,
    // em vez de perder o registro de auditoria por causa de uma referência solta.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      await prisma.consentimentoCookies.create({ data: dados });
    } else {
      throw err;
    }
  }

  return Response.json({ ok: true });
}
