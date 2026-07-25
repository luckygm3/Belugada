import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const template = await prisma.templateDocumento.findUnique({ where: { id } });
  if (!template) {
    return Response.json({ error: "Template não encontrado." }, { status: 404 });
  }

  const body = await req.json();
  const variavelVencimento: string | null = body.variavelVencimento || null;

  if (variavelVencimento && !template.variaveisDetectadas.includes(variavelVencimento)) {
    return Response.json(
      { error: "A variável de vencimento precisa ser uma das detectadas neste template." },
      { status: 400 }
    );
  }

  const diasAlertaVencimento: number[] = Array.isArray(body.diasAlertaVencimento)
    ? body.diasAlertaVencimento
        .map((n: unknown) => Number(n))
        .filter((n: number) => Number.isInteger(n) && n > 0)
    : [];

  const atualizado = await prisma.templateDocumento.update({
    where: { id },
    data: { variavelVencimento, diasAlertaVencimento },
  });

  return Response.json({
    template: {
      variavelVencimento: atualizado.variavelVencimento,
      diasAlertaVencimento: atualizado.diasAlertaVencimento,
    },
  });
}
