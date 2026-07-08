import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { emailOuLogin } = await req.json();

  const usuario = await prisma.usuario.findUnique({ where: { emailOuLogin } });

  // sempre responde sucesso, mesmo se não achar — evita confirmar quais e-mails existem
  if (!usuario) {
    return Response.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expira = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tokenReset: token, tokenResetExpira: expira },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev", // troque pelo seu domínio verificado depois
    to: usuario.emailOuLogin,
    subject: "Redefinição de senha",
    html: `<p>Clique para redefinir sua senha (expira em 30 minutos):</p><a href="${link}">${link}</a>`,
  });

  return Response.json({ ok: true });
}