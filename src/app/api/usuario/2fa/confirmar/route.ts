import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validarCodigoTotp, gerarCodigosBackup } from "@/lib/doisFatores";
import { criptografar } from "@/lib/criptografia";

/** Confirma o código do app autenticador e só então ativa o 2FA de verdade. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const segredo = typeof body?.segredo === "string" ? body.segredo : "";
  const codigo = typeof body?.codigo === "string" ? body.codigo : "";

  if (!segredo || !codigo) {
    return Response.json({ error: "Informe o código gerado pelo app autenticador." }, { status: 400 });
  }

  if (!validarCodigoTotp(segredo, codigo)) {
    return Response.json({ error: "Código inválido. Confira o app autenticador e tente de novo." }, { status: 400 });
  }

  const codigosBackup = gerarCodigosBackup();
  const hashesBackup = await Promise.all(codigosBackup.map((c) => bcrypt.hash(c, 10)));

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: {
      totpSecretCriptografado: criptografar(segredo),
      totpAtivado: true,
      totpCodigosBackup: hashesBackup,
    },
  });

  return Response.json({ codigosBackup });
}
