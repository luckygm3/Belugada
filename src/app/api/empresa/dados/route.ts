import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { empresaAutoEdicaoSchema } from "@/lib/schemas/empresa";
import { primeiraMensagemDeErro, mensagensPorCampo } from "@/lib/schemas/comuns";

/** Empresa-cliente edita os próprios dados não-sensíveis (endereço, telefone, responsável). */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const validado = empresaAutoEdicaoSchema.safeParse(body);
  if (!validado.success) {
    return Response.json(
      { error: primeiraMensagemDeErro(validado.error), campos: mensagensPorCampo(validado.error) },
      { status: 400 }
    );
  }

  const {
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    cep,
    telefone,
    responsavelNome,
    responsavelCargo,
    responsavelTelefone,
    responsavelEmail,
  } = validado.data;

  await prisma.empresa.update({
    where: { id: session.user.empresaId! },
    data: {
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      uf: uf || null,
      cep: cep || null,
      telefone: telefone || null,
      responsavelNome: responsavelNome || null,
      responsavelCargo: responsavelCargo || null,
      responsavelTelefone: responsavelTelefone || null,
      responsavelEmail: responsavelEmail || null,
    },
  });

  return Response.json({ ok: true });
}
