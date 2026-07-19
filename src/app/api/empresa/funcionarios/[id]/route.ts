import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cpf } from "cpf-cnpj-validator";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const funcionarioExistente = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionarioExistente || funcionarioExistente.empresaId !== session.user.empresaId) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }

  const body = await req.json();

  if (!cpf.isValid(body.cpf)) {
    return Response.json({ error: "CPF inválido." }, { status: 400 });
  }

  const cpfLimpo = body.cpf.replace(/\D/g, "");

  const cpfEmUso = await prisma.funcionario.findUnique({ where: { cpf: cpfLimpo } });
  if (cpfEmUso && cpfEmUso.id !== id) {
    return Response.json({ error: "Já existe um funcionário com esse CPF." }, { status: 400 });
  }

  await prisma.funcionario.update({
    where: { id },
    data: {
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
    },
  });

  return Response.json({ funcionarioId: id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const funcionario = await prisma.funcionario.findUnique({
    where: { id },
    include: { documentosGerados: true },
  });

  if (!funcionario || funcionario.empresaId !== session.user.empresaId) {
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

  return Response.json({ ok: true });
}
