import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const VALIDADE_CONVITE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/** Convida um novo admin: cria a conta (inutilizável até o convite ser resgatado) e manda o link de definição de senha. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const emailOuLogin = typeof body?.emailOuLogin === "string" ? body.emailOuLogin.trim() : "";
  if (!emailOuLogin) {
    return Response.json({ error: "Informe um e-mail." }, { status: 400 });
  }

  try {
    // Senha aleatória e nunca compartilhada — a conta só fica utilizável depois
    // que a pessoa define a própria senha pelo link (reaproveita o fluxo de
    // "esqueci minha senha" já existente: mesmos campos, mesma rota, mesma tela).
    const senhaHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    const tokenReset = crypto.randomBytes(32).toString("hex");
    const tokenResetExpira = new Date(Date.now() + VALIDADE_CONVITE_MS);

    await prisma.usuario.create({
      data: { emailOuLogin, senhaHash, papel: "ADMIN", tokenReset, tokenResetExpira },
    });

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${tokenReset}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emailOuLogin,
      subject: "Convite para acessar o PACTA como administrador",
      html: `<p>Você foi convidado para acessar o PACTA como administrador.</p><p>Clique para definir sua senha (link válido por 7 dias):</p><a href="${link}">${link}</a>`,
    });

    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
    }

    console.error("Erro ao convidar admin:", err);
    return Response.json({ error: "Erro ao enviar convite." }, { status: 500 });
  }
}
