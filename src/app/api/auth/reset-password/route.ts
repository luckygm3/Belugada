import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, novaSenha } = await req.json();

  const usuario = await prisma.usuario.findFirst({
    where: { tokenReset: token, tokenResetExpira: { gt: new Date() } },
  });

  if (!usuario) {
    return Response.json({ error: "Token inválido ou expirado" }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash, tokenReset: null, tokenResetExpira: null },
  });

  return Response.json({ ok: true });
}