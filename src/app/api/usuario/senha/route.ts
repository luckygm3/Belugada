import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { senhaSchema } from "@/lib/schemas/perfil";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";
import bcrypt from "bcryptjs";

/** Troca a senha do usuário logado, exigindo confirmação da senha atual. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validado = senhaSchema.safeParse(body);
  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { senhaHash: true },
  });
  if (!usuario) {
    return Response.json({ error: "Sessão inválida — faça login novamente." }, { status: 401 });
  }

  const senhaAtualValida = await bcrypt.compare(validado.data.senhaAtual, usuario.senhaHash);
  if (!senhaAtualValida) {
    return Response.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(validado.data.novaSenha, 10);
  await prisma.usuario.update({ where: { id: session.user.id }, data: { senhaHash } });

  return Response.json({ ok: true });
}
