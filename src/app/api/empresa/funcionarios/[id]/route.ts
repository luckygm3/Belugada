import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { funcionarioSchema } from "@/lib/schemas/funcionario";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";
import { registrarAtividade } from "@/lib/registrarAtividade";
import { notificarPorEmail } from "@/lib/notificarPorEmail";
import { podeAgirPelaEmpresa } from "@/lib/autorizacaoEmpresa";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const funcionarioExistente = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionarioExistente || !podeAgirPelaEmpresa(session, funcionarioExistente.empresaId)) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
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

  const cpfEmUso = await prisma.funcionario.findUnique({ where: { cpf: dados.cpf } });
  if (cpfEmUso && cpfEmUso.id !== id) {
    return Response.json({ error: "Já existe um funcionário com esse CPF." }, { status: 400 });
  }

  await prisma.funcionario.update({
    where: { id },
    data: {
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
    },
  });

  const descricaoAtividade = `${dados.nomeCompleto} teve o cadastro atualizado.`;

  await registrarAtividade({
    tipo: "EDICAO",
    descricao: descricaoAtividade,
    entidade: "Funcionario",
    entidadeId: id,
    empresaId: funcionarioExistente.empresaId,
    usuarioId: session.user.id,
  });
  await notificarPorEmail({ tipo: "EDICAO", descricao: descricaoAtividade, empresaId: funcionarioExistente.empresaId });

  return Response.json({ funcionarioId: id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const funcionario = await prisma.funcionario.findUnique({
    where: { id },
    include: { documentosGerados: true },
  });

  if (!funcionario || !podeAgirPelaEmpresa(session, funcionario.empresaId)) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }

  const caminhosArquivos = funcionario.documentosGerados
    .map((d) => d.urlPdf)
    .filter((url): url is string => !!url);

  if (caminhosArquivos.length > 0) {
    const { error: erroStorage } = await supabaseAdmin.storage
      .from("documentos-gerados")
      .remove(caminhosArquivos);

    if (erroStorage) {
      console.error("Erro ao remover arquivos do Storage:", erroStorage);
      return Response.json(
        { error: "Falha ao remover os documentos gerados. Tente novamente." },
        { status: 500 }
      );
    }
  }

  // DocumentoGerado_funcionarioId_fkey é ON DELETE RESTRICT — sem cascade no schema,
  // então os registros filhos precisam ser apagados antes do Funcionario.
  await prisma.$transaction([
    prisma.documentoGerado.deleteMany({ where: { funcionarioId: id } }),
    prisma.funcionario.delete({ where: { id } }),
  ]);

  const descricaoAtividade = `${funcionario.nomeCompleto} foi excluído.`;

  await registrarAtividade({
    tipo: "EXCLUSAO",
    descricao: descricaoAtividade,
    entidade: "Funcionario",
    entidadeId: id,
    empresaId: funcionario.empresaId,
    usuarioId: session.user.id,
  });
  await notificarPorEmail({ tipo: "EXCLUSAO", descricao: descricaoAtividade, empresaId: funcionario.empresaId });

  return Response.json({ ok: true });
}
