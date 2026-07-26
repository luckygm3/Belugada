import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { funcionarioSchema } from "@/lib/schemas/funcionario";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";
import { registrarAtividade } from "@/lib/registrarAtividade";
import { notificarPorEmail } from "@/lib/notificarPorEmail";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user.papel !== "EMPRESA" && session.user.papel !== "ADMIN")) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();

  // Empresa sempre cadastra na própria empresa (empresaId da sessão, nunca do
  // body); admin precisa dizer explicitamente em nome de qual empresa está
  // cadastrando — não existe um "empresaId da sessão" pra admin.
  const empresaId: string | undefined =
    session.user.papel === "ADMIN" ? body.empresaId : (session.user.empresaId ?? undefined);

  if (!empresaId) {
    return Response.json({ error: "Informe a empresa." }, { status: 400 });
  }

  if (session.user.papel === "ADMIN") {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { id: true } });
    if (!empresa) {
      return Response.json({ error: "Empresa não encontrada." }, { status: 404 });
    }
  }

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
      empresaId,
      nomeCompleto: dados.nomeCompleto,
      cpf: dados.cpf,
      rg: dados.rg,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      estadoCivil: dados.estadoCivil,
      nacionalidade: dados.nacionalidade,
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
      ctpsNumero: dados.ctpsNumero,
      ctpsSerie: dados.ctpsSerie,
      dataAdmissao: dados.dataAdmissao ? new Date(dados.dataAdmissao) : null,
      dataTerminoContrato: dados.dataTerminoContrato ? new Date(dados.dataTerminoContrato) : null,
      tipoContrato: dados.tipoContrato,
      salarioBase: dados.salarioBase ? parseFloat(dados.salarioBase) : null,
      dependentes: dados.dependentes,
      statusDocumentacao: "PENDENTE",
    },
  });

  const descricaoAtividade = `${funcionario.nomeCompleto} foi cadastrado como funcionário.`;

  await registrarAtividade({
    tipo: "CRIACAO",
    descricao: descricaoAtividade,
    entidade: "Funcionario",
    entidadeId: funcionario.id,
    empresaId,
    usuarioId: session.user.id,
  });
  await notificarPorEmail({ tipo: "CRIACAO", descricao: descricaoAtividade, empresaId });

  return Response.json({ funcionarioId: funcionario.id });
}
