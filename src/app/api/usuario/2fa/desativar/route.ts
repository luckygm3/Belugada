import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** Desativa o 2FA — exige a senha atual pra que uma sessão sequestrada não consiga desligar sozinha. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const senhaAtual = typeof body?.senhaAtual === "string" ? body.senhaAtual : "";
  if (!senhaAtual) {
    return Response.json({ error: "Informe a senha atual." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { senhaHash: true },
  });
  if (!usuario) {
    return Response.json({ error: "Sessão inválida — faça login novamente." }, { status: 401 });
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
  if (!senhaValida) {
    return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { totpAtivado: false, totpSecretCriptografado: null, totpCodigosBackup: [] },
  });

  return Response.json({ ok: true });
}
