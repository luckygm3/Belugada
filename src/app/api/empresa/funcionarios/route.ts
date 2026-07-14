import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cpf } from "cpf-cnpj-validator";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();

  if (!cpf.isValid(body.cpf)) {
    return Response.json({ error: "CPF inválido." }, { status: 400 });
  }

  const cpfLimpo = body.cpf.replace(/\D/g, "");

  const jaExiste = await prisma.funcionario.findUnique({ where: { cpf: cpfLimpo } });
  if (jaExiste) {
    return Response.json({ error: "Já existe um funcionário com esse CPF." }, { status: 400 });
  }

  const funcionario = await prisma.funcionario.create({
    data: {
      empresaId: session.user.empresaId!,
      nomeCompleto: body.nomeCompleto,
      cpf: cpfLimpo,
      rg: body.rg,
      dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
      estadoCivil: body.estadoCivil,
      logradouro: body.logradouro,
      numero: body.numero,
      bairro: body.bairro,
      cidade: body.cidade,
      uf: body.uf,
      cep: body.cep,
      telefone: body.telefone,
      email: body.email,
      cargo: body.cargo,
      departamento: body.departamento,
      dataAdmissao: body.dataAdmissao ? new Date(body.dataAdmissao) : null,
      tipoContrato: body.tipoContrato,
      salarioBase: body.salarioBase ? parseFloat(body.salarioBase) : null,
      dependentes: body.dependentes || [],
      statusDocumentacao: "PENDENTE",
    },
  });

  return Response.json({ funcionarioId: funcionario.id });
}