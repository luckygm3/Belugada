import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const templates = await prisma.templateDocumento.findMany({
    where: { tipo: "PERSONALIZADO", ativo: true },
    select: { id: true, nome: true, variaveisDetectadas: true },
    orderBy: { nome: "asc" },
  });

  return Response.json({ templates });
}