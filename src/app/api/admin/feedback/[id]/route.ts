import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const visto = typeof body.visto === "boolean" ? body.visto : true;

  await prisma.notaFeedback.update({ where: { id }, data: { visto } });

  return Response.json({ ok: true });
}
