import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { empresaCadastroSchema } from "@/lib/schemas/empresa";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const validado = empresaCadastroSchema.safeParse(body);

  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const {
    cnpj,
    razaoSocial,
    nomeFantasia,
    logradouro,
    numero,
    bairro,
    cidade,
    uf,
    cep,
    telefone,
    dataAbertura,
    situacaoCadastral,
    naturezaJuridica,
    capitalSocial,
    porteEmpresa,
    cnaePrincipal,
    cnaesSecundarios,
    quadroSocietario,
    responsavelNome,
    responsavelCargo,
    responsavelTelefone,
    responsavelEmail,
    loginAcesso,
    senhaAcesso,
    plano,
    templatePersonalizadoIds,
  } = validado.data;

  try {
    const senhaHash = await bcrypt.hash(senhaAcesso, 10);

    const empresaId = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          cnpj,
          razaoSocial,
          nomeFantasia: nomeFantasia || null,
          logradouro: logradouro || null,
          numero: numero || null,
          bairro: bairro || null,
          cidade: cidade || null,
          uf: uf || null,
          cep: cep || null,
          telefone: telefone || null,
          dataAbertura: dataAbertura ? new Date(dataAbertura) : null,
          situacaoCadastral: situacaoCadastral || null,
          naturezaJuridica: naturezaJuridica || null,
          capitalSocial: capitalSocial ? parseFloat(capitalSocial) : null,
          porteEmpresa: porteEmpresa || null,
          cnaePrincipal: cnaePrincipal || null,
          cnaesSecundarios: Array.isArray(cnaesSecundarios)
            ? cnaesSecundarios.map((c: string) => c.trim()).filter(Boolean)
            : [],
          quadroSocietario:
            Array.isArray(quadroSocietario) && quadroSocietario.length > 0
              ? quadroSocietario
              : undefined,
          responsavelNome: responsavelNome || null,
          responsavelCargo: responsavelCargo || null,
          responsavelTelefone: responsavelTelefone || null,
          responsavelEmail: responsavelEmail || null,
          planoContratado: plano || null,
        },
      });

      await tx.usuario.create({
        data: {
          emailOuLogin: loginAcesso,
          senhaHash,
          papel: "EMPRESA",
          empresaId: empresa.id,
        },
      });
          if (Array.isArray(templatePersonalizadoIds) && templatePersonalizadoIds.length > 0) {
            await tx.empresaTemplatePersonalizado.createMany({
              data: templatePersonalizadoIds.map((templateId: string) => ({
                empresaId: empresa.id,
                templateId,
              })),
            });
          }
      return empresa.id;
    });

    return Response.json({ empresaId }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const campo = (err.meta?.target as string[])?.join(", ") ?? "campo único";
      return Response.json(
        { error: `Já existe um cadastro com esse ${campo}.` },
        { status: 409 }
      );
    }

    console.error("Erro ao cadastrar empresa:", err);
    return Response.json({ error: "Erro ao cadastrar empresa." }, { status: 500 });
  }
}