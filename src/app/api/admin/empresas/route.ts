import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();

  const empresaExistente = await prisma.empresa.findUnique({ where: { cnpj: body.cnpj } });
  if (empresaExistente) {
    return Response.json({ error: "Já existe uma empresa com esse CNPJ." }, { status: 400 });
  }

  const empresa = await prisma.empresa.create({
    data: {
      cnpj: body.cnpj,
      razaoSocial: body.razaoSocial,
      nomeFantasia: body.nomeFantasia,
      logradouro: body.logradouro,
      numero: body.numero,
      bairro: body.bairro,
      cidade: body.cidade,
      uf: body.uf,
      cep: body.cep,
      telefone: body.telefone,
      planoContratado: body.plano,
      dataInicioContrato: new Date(),
      statusPagamento: "ATIVO",
    },
  });

  const senhaHash = await bcrypt.hash(body.senhaAcesso, 10);

  await prisma.usuario.create({
    data: {
      emailOuLogin: body.loginAcesso,
      senhaHash,
      papel: "EMPRESA",
      empresaId: empresa.id,
    },
  });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: body.loginAcesso,
    subject: "Seu acesso à plataforma",
    html: `
      <p>Olá! Sua empresa <strong>${body.razaoSocial}</strong> foi cadastrada.</p>
      <p>Login: ${body.loginAcesso}</p>
      <p>Senha: ${body.senhaAcesso}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Acessar plataforma</a></p>
    `,
  });

  return Response.json({ empresaId: empresa.id });
}