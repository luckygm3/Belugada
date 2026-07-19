import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id: empresaId } = await params;
  const { templateIds } = await req.json();

  // Substitui a seleção inteira: apaga a antiga, grava a nova
  await prisma.$transaction([
    prisma.empresaTemplatePersonalizado.deleteMany({ where: { empresaId } }),
    prisma.empresaTemplatePersonalizado.createMany({
      data: templateIds.map((templateId: string) => ({ empresaId, templateId })),
    }),
  ]);

  return Response.json({ ok: true });
}