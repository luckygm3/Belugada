import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { templateId } = await params;

  await prisma.templateDocumento.update({
    where: { id: templateId },
    data: { ativo: false },
  });

  return Response.json({ ok: true });
}