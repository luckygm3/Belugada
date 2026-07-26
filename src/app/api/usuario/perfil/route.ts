import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { perfilSchema } from "@/lib/schemas/perfil";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";
import { Prisma } from "@prisma/client";

/** Atualiza nome e/ou e-mail (login) do usuário logado. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validado = perfilSchema.safeParse(body);
  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const { nome, emailOuLogin } = validado.data;

  try {
    const atual = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { emailOuLogin: true },
    });
    const emailAlterado = emailOuLogin !== undefined && emailOuLogin !== atual?.emailOuLogin;

    const usuario = await prisma.usuario.update({
      where: { id: session.user.id },
      data: { ...(nome !== undefined ? { nome } : {}), ...(emailOuLogin !== undefined ? { emailOuLogin } : {}) },
      select: { nome: true, emailOuLogin: true },
    });

    return Response.json({ usuario, emailAlterado });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Este e-mail/login já está em uso por outra conta." }, { status: 409 });
    }
    throw err;
  }
}
