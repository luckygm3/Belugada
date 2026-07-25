import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { funcionarioSchema } from "@/lib/schemas/funcionario";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";
import { registrarAtividade } from "@/lib/registrarAtividade";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const validado = funcionarioSchema.safeParse(body);

  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const dados = validado.data;

  const jaExiste = await prisma.funcionario.findUnique({ where: { cpf: dados.cpf } });
  if (jaExiste) {
    return Response.json({ error: "Já existe um funcionário com esse CPF." }, { status: 400 });
  }

  const funcionario = await prisma.funcionario.create({
    data: {
      empresaId: session.user.empresaId!,
      nomeCompleto: dados.nomeCompleto,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      estadoCivil: dados.estadoCivil,
      logradouro: dados.logradouro,
      numero: dados.numero,
      bairro: dados.bairro,
      cidade: dados.cidade,
      uf: dados.uf,
      cep: dados.cep,
      telefone: dados.telefone,
      email: dados.email,
      cargo: dados.cargo,
      departamento: dados.departamento,
      dataAdmissao: dados.dataAdmissao ? new Date(dados.dataAdmissao) : null,
      dataTerminoContrato: dados.dataTerminoContrato ? new Date(dados.dataTerminoContrato) : null,
      tipoContrato: dados.tipoContrato,
      salarioBase: dados.salarioBase ? parseFloat(dados.salarioBase) : null,
      dependentes: dados.dependentes,
      statusDocumentacao: "PENDENTE",
    },
  });

  await registrarAtividade({
    tipo: "CRIACAO",
    descricao: `${funcionario.nomeCompleto} foi cadastrado como funcionário.`,
    entidade: "Funcionario",
    entidadeId: funcionario.id,
    empresaId: session.user.empresaId!,
    usuarioId: session.user.id,
  });

  return Response.json({ funcionarioId: funcionario.id });
}