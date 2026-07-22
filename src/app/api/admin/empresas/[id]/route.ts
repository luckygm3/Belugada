import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { empresaEdicaoSchema } from "@/lib/schemas/empresa";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const empresaExistente = await prisma.empresa.findUnique({ where: { id } });
  if (!empresaExistente) {
    return Response.json({ error: "Empresa não encontrada." }, { status: 404 });
  }

  const body = await req.json();
  const validado = empresaEdicaoSchema.safeParse(body);

  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const {
    razaoSocial,
    nomeFantasia,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    cep,
    telefone,
    emailCorporativo,
    planoContratado,
    statusPagamento,
    responsavelNome,
    responsavelCargo,
    responsavelTelefone,
    responsavelEmail,
  } = validado.data;

  try {
    await prisma.empresa.update({
      where: { id },
      data: {
        razaoSocial,
        nomeFantasia: nomeFantasia || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        uf: uf || null,
        cep: cep || null,
        telefone: telefone || null,
        emailCorporativo: emailCorporativo || null,
        planoContratado: planoContratado || null,
        statusPagamento,
        responsavelNome: responsavelNome || null,
        responsavelCargo: responsavelCargo || null,
        responsavelTelefone: responsavelTelefone || null,
        responsavelEmail: responsavelEmail || null,
      },
    });

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Já existe um cadastro com esse valor único." }, { status: 409 });
    }

    console.error("Erro ao atualizar empresa:", err);
    return Response.json({ error: "Erro ao salvar alterações." }, { status: 500 });
  }
}
